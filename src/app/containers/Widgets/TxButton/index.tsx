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

import * as React from 'react';
import * as uuid from 'uuid';
import { OrderedMap } from 'immutable';
import { connect } from 'react-redux';
import { IRootState } from 'modules';
import { txCall } from 'modules/tx/actions';
import { TTransactionStatus, ITransaction } from 'genesis/tx';
import { alertShow, navigatePage } from 'modules/content/actions';

import TxButton, { ITxButtonConfirm } from 'components/TxButton';

interface ITxButtonContainerProps {
    className?: string;
    contractName?: string;
    contractParams?: { [name: string]: any } | (() => { [name: string]: any });
    confirm?: ITxButtonConfirm;
    page?: string;
    pageParams?: { [key: string]: any };
    disabled?: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onExec?: (block: string, error?: { type: string, error: string }) => void;
}

interface ITxButtonStateProps {
    transactions: OrderedMap<string, TTransactionStatus>;
    confirmation: { id: string, success: string, error: string };
}

interface ITxButtonDispatchProps {
    callContract: typeof txCall;
    alertShow: typeof alertShow;
    navigatePage: typeof navigatePage.started;
}

class TxButtonContainer extends React.Component<ITxButtonContainerProps & ITxButtonStateProps & ITxButtonDispatchProps> {
    private _uuid: string;

    componentWillReceiveProps(props: ITxButtonContainerProps & ITxButtonStateProps & ITxButtonDispatchProps) {
        if (props.confirmation && props.confirmation.id === this._uuid && props.confirmation.success) {
            this._uuid = uuid.v4();

            if (this.props.contractName) {
                this.onExecContract(this.props.contractName, this.props.contractParams);
            }
            else if (this.props.page) {
                this.onNavigate(this.props.page, this.props.pageParams);
            }
        }
    }

    prepareParams(params: { [key: string]: any }) {
        const result: { [key: string]: any } = {};
        for (let itr in params) {
            if (params.hasOwnProperty(itr)) {
                const param = params[itr];
                // Arrays
                if (Array.isArray(param)) {
                    result[`${itr}[]`] = param.length;
                    param.forEach((p, i) => {
                        result[`${itr}[${i}]`] = p;
                    });
                }
                else {
                    result[itr] = param;
                }
            }
        }
        return result;
    }

    onExecContract(name: string, params: { [name: string]: any } | (() => { [name: string]: any }), confirm?: ITxButtonConfirm) {
        this._uuid = uuid.v4();

        if (confirm) {
            // Stop executing contract if provided parameters were invalid
            if ('function' === typeof this.props.contractParams) {
                if (null === this.props.contractParams()) {
                    return;
                }
            }

            this.props.alertShow({
                id: this._uuid,
                type: confirm.icon,
                title: confirm.title,
                text: confirm.text,
                confirmButton: confirm.confirmButton,
                cancelButton: confirm.cancelButton
            });
        }
        else {
            let contractParams = {};
            if ('function' === typeof this.props.contractParams) {
                contractParams = this.props.contractParams();

                // Stop executing contract if provided parameters were invalid
                if (null === contractParams) {
                    return;
                }
                else {
                    contractParams = this.prepareParams(contractParams);
                }
            }
            else {
                contractParams = this.props.contractParams;
            }

            this.props.callContract({
                uuid: this._uuid,
                name: this.props.contractName,
                params: contractParams
            });
        }
    }

    onNavigate(page: string, params: { [key: string]: any } | (() => { [key: string]: any }), confirm?: ITxButtonConfirm) {
        let pageParams = {};
        if ('function' === typeof params) {
            pageParams = (this.props.pageParams as Function)();

            // Stop redirection if provided parameters were invalid
            if (null === pageParams) {
                return;
            }
            else {
                pageParams = this.prepareParams(pageParams);
            }
        }
        else {
            pageParams = params;
        }

        this._uuid = uuid.v4();

        if (confirm) {
            this.props.alertShow({
                id: this._uuid,
                type: confirm.icon,
                title: confirm.title,
                text: confirm.text,
                confirmButton: confirm.confirmButton,
                cancelButton: confirm.cancelButton
            });
        }
        else {
            this.props.navigatePage({
                name: page,
                params: pageParams,
                force: true
            });
        }
    }

    render() {
        const transaction = this.props.transactions.get(this._uuid) as ITransaction;
        const pending = transaction && !transaction.block && !transaction.error;
        const contractStatus = transaction && { block: transaction.block, error: transaction.error };

        return (
            <TxButton
                {...this.props}
                pending={pending}
                disabled={this.props.disabled}
                className={this.props.className}
                contractName={this.props.contractName}
                contractParams={this.props.contractParams}
                contractStatus={contractStatus}
                execContract={this.onExecContract.bind(this)}
                onExec={this.props.onExec}
                navigate={this.onNavigate.bind(this)}

            >
                {this.props.children}
            </TxButton>
        );
    }
}

const mapStateToProps = (state: IRootState) => ({
    transactions: state.tx.transactions,
    confirmation: state.content.alert
});

const mapDispatchToProps = {
    callContract: txCall,
    navigatePage: navigatePage.started,
    alertShow,
};

export default connect<ITxButtonStateProps, ITxButtonDispatchProps, ITxButtonContainerProps>(mapStateToProps, mapDispatchToProps)(TxButtonContainer);