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
import { injectIntl, InjectedIntlProps } from 'react-intl';
import * as propTypes from 'prop-types';
import * as classnames from 'classnames';

import Protypo, { IParamsSpec } from '../Protypo';
import ValidatedForm from 'components/Validation/ValidatedForm';
import TxButton from 'containers/Widgets/TxButton';
import TxBatchButton from 'containers/Widgets/TxBatchButton';

import TagWrapper from '../components/TagWrapper';
import DnDComponent from './DnDComponent';

export interface IButtonProps {
    'class'?: string;
    'alert'?: {
        icon: string;
        text: string;
        confirmbutton: string;
        cancelbutton: string;
    };
    'contract'?: string;
    'composite'?: {
        name: string;
        data: {
            [key: string]: any;
        }[]
    }[];
    'page'?: string;
    'pageparams'?: IParamsSpec;
    'params'?: IParamsSpec;
    'formID'?: number;

    'editable'?: boolean;
    'changePage'?: any;
    'setTagCanDropPosition'?: any;
    'addTag'?: any;
    'moveTag'?: any;
    'copyTag'?: any;
    'removeTag'?: any;
    'selectTag'?: any;
    'selected'?: boolean;
    'tag'?: any;

    'canDropPosition'?: string;

    connectDropTarget?: any;
    isOver?: boolean;

    connectDragSource?: any;
    connectDragPreview?: any;
    isDragging?: boolean;
}

interface IButtonContext {
    form: ValidatedForm;
    protypo: Protypo;
}

const Button: React.SFC<IButtonProps & InjectedIntlProps> = (props, context: IButtonContext) => {
    const getParams = () => {
        const params = {};

        if (context.form) {
            const payload = context.form.validateAll();
            if (!payload.valid) {
                return null;
            }

            for (let itr in payload.payload) {
                if (payload.payload.hasOwnProperty(itr)) {
                    params[itr] = payload.payload[itr].value;
                }
            }

            return {
                ...params,
                ...context.protypo.resolveParams(props.params, payload.payload)
            };
        }

        return {
            ...params,
            ...context.protypo.resolveParams(props.params)
        };
    };

    const getPageParams = () => {
        if (context.form) {
            const payload = context.form.validateAll();
            if (!payload.valid) {
                return null;
            }

            return context.protypo.resolveParams(props.pageparams, payload.payload);
        }
        else {
            return context.protypo.resolveParams(props.pageparams);
        }
    };

    const onClick = (e: any) => {
        e.stopPropagation();
        props.selectTag({ tag: props.tag });
    };

    const onBlur = (e: any) => {
        e.stopPropagation();
        props.changePage({ text: e.target.innerHTML, tagID: props.tag.id });
    };

    const removeTag = () => {
        props.removeTag({ tag: props.tag });
    };

    if (props.editable) {
        const { connectDropTarget, connectDragSource, connectDragPreview, isOver } = props;

        const classes = classnames({
            [props.class]: true,
            // [props.className]: true,
            'b-selected': props.selected
        });

        return connectDragPreview(connectDropTarget(
            <span style={{ display: 'inline-block' }}>
                <TagWrapper
                    display="inline"
                    selected={props.selected}
                    canDrop={isOver}
                    canDropPosition={props.canDropPosition}
                    onClick={onClick}
                    removeTag={removeTag}
                    connectDragSource={connectDragSource}
                    canMove={true}
                >
                    <button
                        className={classes}
                    >
                        <span
                            contentEditable={props.selected}
                            onBlur={onBlur}
                        >
                            {props.children}
                        </span>
                    </button>
                </TagWrapper>
            </span>
        ));
    }

    if (props.composite) {
        return (
            <TxBatchButton
                className={props.class}
                contracts={props.composite}
                confirm={props.alert && {
                    icon: props.alert.icon,
                    title: props.intl.formatMessage({ id: 'alert.confirmation', defaultMessage: 'Confirmation' }),
                    text: props.alert.text,
                    confirmButton: props.alert.confirmbutton,
                    cancelButton: props.alert.cancelbutton
                }}
                page={props.page}
                pageParams={getPageParams}
            >
                {props.children}
            </TxBatchButton>
        );
    }
    else {
        return (
            <TxButton
                className={props.class}
                contractName={props.contract}
                contractParams={getParams}
                confirm={props.alert && {
                    icon: props.alert.icon,
                    title: props.intl.formatMessage({ id: 'alert.confirmation', defaultMessage: 'Confirmation' }),
                    text: props.alert.text,
                    confirmButton: props.alert.confirmbutton,
                    cancelButton: props.alert.cancelbutton
                }}
                page={props.page}
                pageParams={getPageParams}
            >
                {props.children}
            </TxButton>
        );
    }
};

Button.contextTypes = {
    form: propTypes.object,
    protypo: propTypes.object.isRequired
};

export default injectIntl(Button);
export const ButtonDnD = DnDComponent(injectIntl(Button));