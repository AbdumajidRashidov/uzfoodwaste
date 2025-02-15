import React from 'react';

import {useDispatch, useSelector} from 'react-redux';
import type {TypedUseSelectorHook} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import type {RootState, AppDispatch} from '../store/store';
import {RootStackParamList} from '../types/RootStackParamList';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppNavigation: () => NativeStackNavigationProp<RootStackParamList> =
  useNavigation;

// export const navigationRef: any = React.createRef();
// export const navigation = useAppNavigation();

const getActiveRouteName = (state: any): any => {
  const route = state.routes[state.index];

  if (route.state) {
    return getActiveRouteName(route.state);
  }

  return route.name;
};

// export const useAppRouteName: () => any = () => {
//     const navigation = useAppNavigation();
//     const routeName = getActiveRouteName(navigation?.getRootState());
//     return routeName;
// };

// const getCurrentRoute = (navigationState: any): any => {
//   if (!navigationState) {
//     return null;
//   }

//   const route = navigationState.routes[navigationState.index];

//   if (route.state) {
//     return getCurrentRoute(route.state);
//   }

//   return route;
// };

export const Stack = createNativeStackNavigator<RootStackParamList>();
