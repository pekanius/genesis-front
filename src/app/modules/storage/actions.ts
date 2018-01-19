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

import actionCreatorFactory from 'typescript-fsa';
import { IStoredAccount } from 'apla/storage';

const actionCreator = actionCreatorFactory('storage');
export const saveAccount = actionCreator<IStoredAccount>('SAVE_ACCOUNT');
export const removeAccount = actionCreator<IStoredAccount>('REMOVE_ACCOUNT');
export const saveNavigationSize = actionCreator<number>('SAVE_NAVIGATION_SIZE');
export const addTabList = actionCreator<{ addID?: string, addName?: string, addType?: string, addVDE?: boolean }>('ADD_TAB_LIST');
export const removeTabList = actionCreator<{ id: string, type: string, vde?: boolean }>('REMOVE_TAB_LIST');
