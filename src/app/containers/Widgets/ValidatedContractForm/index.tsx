// Copyright 2017 The apla-front Authors
// This file is part of the apla-front library.
// 
// The apla-front library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// The apla-front library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
// 
// You should have received a copy of the GNU Lesser General Public License
// along with the apla-front library. If not, see <http://www.gnu.org/licenses/>.

import * as React from 'react';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { toastr } from 'react-redux-toastr';
import { Map } from 'immutable';
import { IRootState } from 'modules';
import { contractExec } from 'modules/tx/actions';
import { alertShow } from 'modules/content/actions';
import * as uuid from 'uuid';

import Validation from 'components/Validation';

interface IValidatedContractFormProps {
    vde?: boolean;
    className?: string;
    contractName: string;
    mapContractParams: (values: { [key: string]: any }) => { [key: string]: any };
    onExec?: (block: string, error: string) => void;
}

interface IValidatedContractFormStateProps {
    transactions: Map<string, { block: string, error: string }>;
}

interface IValidatedContractFormDispatchProps {
    contractExec: typeof contractExec.started;
    alertShow: typeof alertShow;
}

class ValidatedContractForm extends React.Component<IValidatedContractFormProps & IValidatedContractFormStateProps & IValidatedContractFormDispatchProps & InjectedIntlProps> {
    private _uuid: string;
    private _pending: boolean;

    componentDidMount() {
        this._uuid = uuid.v4();
    }

    componentWillReceiveProps(props: IValidatedContractFormProps & IValidatedContractFormStateProps & IValidatedContractFormDispatchProps) {
        const transaction = props.transactions.get(this._uuid);
        if (this._pending && transaction && (transaction.block || transaction.error)) {
            this._pending = false;

            if (transaction.block) {
                toastr.success(
                    props.contractName,
                    this.props.intl.formatMessage(
                        {
                            id: 'tx.imprinted.block',
                            defaultMessage: 'Imprinted in the blockchain (block #{block})'
                        }, {
                            block: transaction.block
                        }
                    ),
                );
            }
            else if (transaction.error) {
                try {
                    const error: { type: string, error: string } = JSON.parse(transaction.error);
                    switch (error.type) {
                        case 'panic':
                            this.alert(
                                'error',
                                this.props.intl.formatMessage({ id: 'tx.panic', defaultMessage: 'Runtime error' }),
                                error.error,
                                this.props.intl.formatMessage({ id: 'general.close', defaultMessage: 'Close' })
                            ); break;

                        case 'warning':
                            this.alert(
                                'warning',
                                this.props.intl.formatMessage({ id: 'tx.warning', defaultMessage: 'Warning' }),
                                error.error,
                                this.props.intl.formatMessage({ id: 'general.close', defaultMessage: 'Close' })
                            ); break;

                        case 'error':
                            this.alert(
                                'error',
                                this.props.intl.formatMessage({ id: 'tx.error', defaultMessage: 'Error' }),
                                error.error,
                                this.props.intl.formatMessage({ id: 'general.close', defaultMessage: 'Close' })
                            ); break;

                        case 'info':
                            this.alert(
                                'info',
                                this.props.intl.formatMessage({ id: 'tx.info', defaultMessage: 'Information' }),
                                error.error,
                                this.props.intl.formatMessage({ id: 'general.close', defaultMessage: 'Close' })
                            ); break;
                        default: break;
                    }
                }
                catch (e) {
                    /* Suppress parse errors */
                }
                toastr.error(
                    props.contractName,
                    this.props.intl.formatMessage({ id: 'tx.error', defaultMessage: 'Error executing transaction' })
                );
            }

            if (this.props.onExec) {
                this.props.onExec(transaction.block, transaction.error);
            }
        }
    }

    alert(type: string, title: string, text: string, buttonText: string) {
        this.props.alertShow({
            id: this._uuid,
            type,
            title,
            text,
            cancelButton: buttonText
        });
    }

    onSubmit(values: { [key: string]: any }) {
        const params = this.props.mapContractParams(values);
        this._pending = true;
        this.props.contractExec({
            vde: this.props.vde,
            uuid: this._uuid,
            name: this.props.contractName,
            params
        });
    }

    render() {
        const transaction = this.props.transactions.get(this._uuid);
        const pending = transaction && !transaction.block && !transaction.error;

        return (
            <Validation.components.ValidatedForm className={this.props.className} onSubmitSuccess={this.onSubmit.bind(this)} pending={pending}>
                {this.props.children}
            </Validation.components.ValidatedForm>
        );
    }
}

const mapStateToProps = (state: IRootState) => ({
    transactions: state.tx.transactions
});

const mapDispatchToProps = {
    alertShow,
    contractExec: contractExec.started
};

const LocalizedValidatedContractForm = injectIntl(ValidatedContractForm);
export default connect<IValidatedContractFormStateProps, IValidatedContractFormDispatchProps, IValidatedContractFormProps>(mapStateToProps, mapDispatchToProps)(LocalizedValidatedContractForm);