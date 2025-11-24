import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExploreStackParamList } from './types';
import ExploreScreen from '../screens/ExploreScreen';
import DetailsScreen from '../screens/DetailsScreen';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ExploreMain" component={ExploreScreen} options={{ title: 'Explore' }} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}
