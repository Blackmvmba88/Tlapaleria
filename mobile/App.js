// Componente principal de la aplicación móvil
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { initOfflineDB } from './src/services/offlineStorage';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

// Importar pantallas
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import InventarioScreen from './src/screens/InventarioScreen';
import VentasScreen from './src/screens/VentasScreen';
import EstadisticasScreen from './src/screens/EstadisticasScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegación principal con tabs
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#7C3AED',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color }) => <View><Text style={{ fontSize: 24, color }}>📊</Text></View>,
        }}
      />
      <Tab.Screen
        name="Inventario"
        component={InventarioScreen}
        options={{
          title: 'Inventario',
          tabBarLabel: 'Inventario',
          tabBarIcon: ({ color }) => <View><Text style={{ fontSize: 24, color }}>📦</Text></View>,
        }}
      />
      <Tab.Screen
        name="Ventas"
        component={VentasScreen}
        options={{
          title: 'Registrar Venta',
          tabBarLabel: 'Ventas',
          tabBarIcon: ({ color }) => <View><Text style={{ fontSize: 24, color }}>💰</Text></View>,
        }}
      />
      <Tab.Screen
        name="Estadisticas"
        component={EstadisticasScreen}
        options={{
          title: 'Estadísticas',
          tabBarLabel: 'Estadísticas',
          tabBarIcon: ({ color }) => <View><Text style={{ fontSize: 24, color }}>📈</Text></View>,
        }}
      />
    </Tab.Navigator>
  );
};

// Navegación de la aplicación
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
};

// Componente principal
export default function App() {
  useEffect(() => {
    // Inicializar base de datos offline al arrancar la app
    initOfflineDB()
      .then(() => console.log('Base de datos offline inicializada'))
      .catch((error) => console.error('Error al inicializar BD offline:', error));
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
