// Pantalla de inventario con lista de productos
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { productosService } from '../services/api';
import { productosOfflineService, checkConnection } from '../services/offlineStorage';

const InventarioScreen = ({ navigation }) => {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  const cargarProductos = async () => {
    try {
      const online = await checkConnection();
      setIsOnline(online);

      if (online) {
        // Cargar desde API
        const data = await productosService.listar();
        setProductos(data);
        setFilteredProductos(data);
        // Guardar en caché
        await productosOfflineService.guardarCache(data);
      } else {
        // Cargar desde caché
        const cachedData = await productosOfflineService.obtenerCache();
        setProductos(cachedData);
        setFilteredProductos(cachedData);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarProductos();
  }, []);

  const handleSearch = (text) => {
    setSearchTerm(text);
    if (text === '') {
      setFilteredProductos(productos);
    } else {
      const filtered = productos.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(text.toLowerCase()) ||
          producto.descripcion?.toLowerCase().includes(text.toLowerCase()) ||
          producto.codigo_barras?.includes(text)
      );
      setFilteredProductos(filtered);
    }
  };

  const renderProducto = ({ item }) => {
    const stockBajo = item.stock_actual <= item.stock_minimo;
    
    return (
      <TouchableOpacity
        style={styles.productoCard}
        onPress={() => navigation.navigate('DetalleProducto', { producto: item })}
      >
        <View style={styles.productoHeader}>
          <Text style={styles.productoNombre}>{item.nombre}</Text>
          {stockBajo && <Text style={styles.badgeStockBajo}>⚠️ Stock Bajo</Text>}
        </View>

        {item.descripcion && (
          <Text style={styles.productoDescripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}

        <View style={styles.productoInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Precio:</Text>
            <Text style={styles.infoPrecio}>${item.precio.toFixed(2)}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Stock:</Text>
            <Text style={[styles.infoValue, stockBajo && styles.stockBajoText]}>
              {item.stock_actual} unidades
            </Text>
          </View>
        </View>

        {item.categoria && (
          <Text style={styles.productoCategoria}>📁 {item.categoria}</Text>
        )}

        {item.ubicacion && (
          <Text style={styles.productoUbicacion}>📍 {item.ubicacion}</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Cargando inventario...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>📡 Modo sin conexión</Text>
        </View>
      )}

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos..."
          value={searchTerm}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          📦 {filteredProductos.length} productos
        </Text>
        {searchTerm !== '' && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Text style={styles.clearText}>Limpiar búsqueda</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredProductos}
        renderItem={renderProducto}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron productos</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  offlineBanner: {
    backgroundColor: '#FFA500',
    padding: 10,
    alignItems: 'center',
  },
  offlineText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  clearText: {
    color: '#7C3AED',
    fontSize: 14,
  },
  listContainer: {
    padding: 15,
  },
  productoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productoNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badgeStockBajo: {
    backgroundColor: '#FFA500',
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  productoDescripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  productoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  infoPrecio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  stockBajoText: {
    color: '#FFA500',
  },
  productoCategoria: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productoUbicacion: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default InventarioScreen;
