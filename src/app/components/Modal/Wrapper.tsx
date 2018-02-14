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
import Transition from 'react-transition-group/Transition';
import styled from 'styled-components';

const containerAnimationDuration = 210;
const containerAnimationDef = {
    defaultStyle: {
        transition: 'opacity .21s ease-in-out',
        opacity: 0
    },

    entering: {
        height: 'auto',
        display: 'block',
        opacity: 1
    },
    entered: {
        opacity: 1
    },

    exiting: {
        opacity: 0
    },

    exited: {
        height: 0,
        padding: 0,
        margin: 0,
        opacity: 0
    }
};

const childAnimationDuration = 210;
const childAnimationDef = {
    defaultStyle: {
        transform: 'translateY(-30px)',
        transition: 'transform .21s ease-in-out, opacity .21s ease-in-out',
        opacity: 0
    },

    entering: {
        transform: 'translateY(0)',
        opacity: 1
    },

    entered: {
        transform: 'translateY(0)',
        opacity: 1
    },

    exiting: {
        transform: 'translateY(30px)',
        opacity: 0
    }
};

const StyledModalWrapper = styled.div`
    background: rgba(0,0,0,0.3);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9000;
    text-align: center;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 50px;
    margin-top: ${props => props.style.marginTop}px;

    &::before {
        content: ' ';
        display: inline-block;
        height: 100%;
        width: 1px;
        vertical-align: middle;
        font-size: 0;
    }

    > .modal-wnd {
        display: inline-block;
        border: solid 1px #71a2e0;
        background: #fff;
        vertical-align: middle;
        text-align: initial;
        max-width: 95%;
        overflow: hidden;
    }
`;

export interface IModalWrapperProps {
    topOffset?: number;
}

class ModalWrapper extends React.Component<IModalWrapperProps> {
    private _children: React.ReactNode;
    private _lastChildState: string;

    componentDidMount() {
        this._children = this.props.children;
    }

    componentWillReceiveProps(props: IModalWrapperProps & { children: React.ReactNode }) {
        if (null !== props.children) {
            this._children = props.children;
        }
    }

    renderChild(state: string) {
        // Unmount hidden modal window
        if ('exiting' === this._lastChildState && 'exited' === state) {
            this._children = null;
        }

        // We must remember last state to correctly destroy the modal window
        // when disappear animation has done it's work
        this._lastChildState = state;
        return (
            <div className="modal-wnd" style={{ ...childAnimationDef.defaultStyle, ...childAnimationDef[state] }}>
                {this._children}
            </div>
        );
    }

    render() {
        return (
            <Transition in={!!this.props.children} timeout={containerAnimationDuration}>
                {(state: string) => (
                    <StyledModalWrapper style={{ ...containerAnimationDef.defaultStyle, ...containerAnimationDef[state], marginTop: this.props.topOffset }}>
                        <Transition in={state === 'entered'} timeout={childAnimationDuration}>
                            {this.renderChild.bind(this)}
                        </Transition>
                    </StyledModalWrapper>
                )}
            </Transition >

        );
    }
}

export default ModalWrapper;