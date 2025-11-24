// Pantalla para registrar ventas
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { productosService, ventasService } from '../services/api';
import { ventasOfflineService, productosOfflineService, checkConnection } from '../services/offlineStorage';
import { useAuth } from '../context/AuthContext';

const VentasScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState('1');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    verificarConexion();
  }, []);

  const verificarConexion = async () => {
    const online = await checkConnection();
    setIsOnline(online);
  };

  const buscarProductos = async () => {
    if (!searchTerm.trim()) {
      setProductos([]);
      return;
    }

    setSearching(true);
    try {
      const online = await checkConnection();
      setIsOnline(online);

      if (online) {
        const resultados = await productosService.buscar(searchTerm);
        setProductos(resultados);
      } else {
        const resultados = await productosOfflineService.buscarCache(searchTerm);
        setProductos(resultados);
      }
    } catch (error) {
      console.error('Error al buscar productos:', error);
      Alert.alert('Error', 'No se pudieron buscar los productos');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      buscarProductos();
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setCantidad('1');
    setSearchTerm('');
    setProductos([]);
  };

  const calcularTotal = () => {
    if (!productoSeleccionado || !cantidad) return 0;
    return productoSeleccionado.precio * parseInt(cantidad || 0);
  };

  const registrarVenta = async () => {
    if (!productoSeleccionado) {
      Alert.alert('Error', 'Debes seleccionar un producto');
      return;
    }

    const cantidadNum = parseInt(cantidad);
    if (!cantidadNum || cantidadNum <= 0) {
      Alert.alert('Error', 'La cantidad debe ser mayor a 0');
      return;
    }

    if (cantidadNum > productoSeleccionado.stock_actual) {
      Alert.alert(
        'Stock insuficiente',
        `Solo hay ${productoSeleccionado.stock_actual} unidades disponibles`
      );
      return;
    }

    setLoading(true);

    try {
      const online = await checkConnection();
      setIsOnline(online);

      const ventaData = {
        producto_id: productoSeleccionado.id,
        cantidad: cantidadNum,
        precio_unitario: productoSeleccionado.precio,
        total: calcularTotal(),
      };

      if (online) {
        // Registrar en servidor
        await ventasService.registrar(ventaData);
        Alert.alert(
          'Éxito',
          'Venta registrada correctamente',
          [{ text: 'OK', onPress: limpiarFormulario }]
        );
      } else {
        // Registrar localmente
        await ventasOfflineService.registrarLocal(ventaData);
        Alert.alert(
          'Venta guardada localmente',
          'La venta se sincronizará cuando haya conexión',
          [{ text: 'OK', onPress: limpiarFormulario }]
        );
      }
    } catch (error) {
      console.error('Error al registrar venta:', error);
      Alert.alert('Error', 'No se pudo registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setProductoSeleccionado(null);
    setCantidad('1');
    setSearchTerm('');
    setProductos([]);
  };

  return (
    <ScrollView style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            📡 Modo sin conexión - Las ventas se guardarán localmente
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>Registrar Nueva Venta</Text>

        {/* Búsqueda de productos */}
        <View style={styles.section}>
          <Text style={styles.label}>Buscar Producto</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre, código de barras..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {searching && (
            <ActivityIndicator size="small" color="#7C3AED" style={{ marginTop: 10 }} />
          )}

          {productos.length > 0 && (
            <View style={styles.resultadosContainer}>
              <FlatList
                data={productos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.resultadoItem}
                    onPress={() => seleccionarProducto(item)}
                  >
                    <Text style={styles.resultadoNombre}>{item.nombre}</Text>
                    <Text style={styles.resultadoInfo}>
                      ${item.precio.toFixed(2)} - Stock: {item.stock_actual}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        {/* Producto seleccionado */}
        {productoSeleccionado && (
          <View style={styles.section}>
            <Text style={styles.label}>Producto Seleccionado</Text>
            <View style={styles.productoCard}>
              <Text style={styles.productoNombre}>
                {productoSeleccionado.nombre}
              </Text>
              <Text style={styles.productoPrecio}>
                ${productoSeleccionado.precio.toFixed(2)} por unidad
              </Text>
              <Text style={styles.productoStock}>
                Stock disponible: {productoSeleccionado.stock_actual} unidades
              </Text>
            </View>

            <Text style={styles.label}>Cantidad</Text>
            <TextInput
              style={styles.input}
              value={cantidad}
              onChangeText={setCantidad}
              keyboardType="number-pad"
              placeholder="Cantidad"
            />

            {/* Total */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${calcularTotal().toFixed(2)}</Text>
            </View>

            {/* Botones */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={limpiarFormulario}
                disabled={loading}
              >
                <Text style={styles.buttonSecondaryText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={registrarVenta}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonPrimaryText}>Registrar Venta</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  offlineBanner: {
    backgroundColor: '#FFA500',
    padding: 10,
    alignItems: 'center',
  },
  offlineText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  resultadosContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 10,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultadoItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultadoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resultadoInfo: {
    fontSize: 14,
    color: '#666',
  },
  productoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productoNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productoPrecio: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '600',
    marginBottom: 4,
  },
  productoStock: {
    fontSize: 14,
    color: '#666',
  },
  totalContainer: {
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    padding: 20,
    marginVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#7C3AED',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondaryText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VentasScreen;
