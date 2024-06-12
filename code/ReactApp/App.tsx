import {View, Text} from 'react-native';
import React from 'react';

import Characters from './src/Characters';
import {QueryClient, QueryClientProvider} from 'react-query';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <View
        style={{
          backgroundColor: 'white',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Characters />
      </View>
    </QueryClientProvider>
  );
};

export default App;
