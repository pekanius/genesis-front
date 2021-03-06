// Copyright 2017 The genesis-front Authors
// This file is part of the genesis-front library.
// 
// The genesis-front library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// The genesis-front library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
// 
// You should have received a copy of the GNU Lesser General Public License
// along with the genesis-front library. If not, see <http://www.gnu.org/licenses/>.

import { IRootState } from 'modules';
import { Epic } from 'redux-observable';
import { Action } from 'redux';
import { Observable } from 'rxjs';
import keyring from 'lib/keyring';
import api, { IAPIError } from 'lib/api';
import { txExec, txPrepare } from '../actions';
import { modalShow, modalClose } from 'modules/modal/actions';
import { TTxError } from 'genesis/tx';

const txPrepareEpic: Epic<Action, IRootState> =
    (action$, store) => action$.ofAction(txPrepare)
        .flatMap(action => {
            const state = store.getState();

            if (!keyring.validatePrivateKey(action.payload.privateKey)) {
                Observable.of(txExec.failed({
                    params: action.payload,
                    error: {
                        type: 'E_INVALID_PASSWORD',
                        error: null
                    }
                }));
            }

            const txCall = {
                ...action.payload.tx,
                params: {
                    ...action.payload.tx.params,
                    Lang: state.storage.locale
                }
            };

            return Observable.fromPromise(api.txPrepare(state.auth.sessionToken, txCall.name, txCall.params))
                .flatMap(prepare => {
                    let forSign = prepare.forsign;
                    const signParams = {};

                    if (prepare.signs) {
                        return Observable.merge(
                            Observable.of(modalShow({
                                id: 'SIGNATURE',
                                type: 'TX_SIGNATURE',
                                params: {
                                    txParams: txCall.params,
                                    signs: prepare.signs,
                                    contract: txCall.name
                                }
                            })),
                            action$.ofAction(modalClose)
                                .take(1)
                                .switchMap(modal => {
                                    if ('RESULT' !== modal.payload.reason) {
                                        throw { error: 'E_CANCELLED' };
                                    }

                                    prepare.signs.forEach(sign => {
                                        const childSign = keyring.sign(sign.forsign, action.payload.privateKey);
                                        signParams[sign.field] = childSign;
                                        forSign += `,${childSign}`;
                                    });

                                    return Observable.of(txExec.started({
                                        tx: txCall,
                                        time: prepare.time,
                                        privateKey: action.payload.privateKey,
                                        signature: keyring.sign(forSign, action.payload.privateKey),
                                        signParams
                                    }));
                                })
                        );
                    }
                    else {
                        return Observable.of(txExec.started({
                            tx: txCall,
                            time: prepare.time,
                            privateKey: action.payload.privateKey,
                            signature: keyring.sign(forSign, action.payload.privateKey)
                        }));
                    }
                })
                .catch((e: IAPIError) => Observable.of(txExec.failed({
                    params: action.payload,
                    error: {
                        type: e.error as TTxError,
                        error: e.msg
                    }
                })));

        });

export default txPrepareEpic;