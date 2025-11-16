#!/usr/bin/env python3
"""
Tlapalería CLI - Herramienta de línea de comandos para gestionar la tlapalería
Autor: Iyari Cancino Gomez
Cliente: Jesús Morán
Versión: 1.0.0
"""

import sqlite3
import sys
import os
from datetime import datetime
from typing import List, Tuple, Optional
import argparse


class TlapaleriaCLI:
    """Clase principal para la interfaz de línea de comandos de la tlapalería"""
    
    def __init__(self, db_path: str = "backend/tlapaleria.db"):
        """
        Inicializa la conexión a la base de datos
        
        Args:
            db_path: Ruta al archivo de base de datos SQLite
        """
        self.db_path = db_path
        self.conn = None
        self.cursor = None
        self._connect()
    
    def _connect(self):
        """Establece conexión con la base de datos"""
        try:
            self.conn = sqlite3.connect(self.db_path)
            self.cursor = self.conn.cursor()
            print(f"✅ Conectado a la base de datos: {self.db_path}")
        except sqlite3.Error as e:
            print(f"❌ Error al conectar con la base de datos: {e}")
            sys.exit(1)
    
    def close(self):
        """Cierra la conexión a la base de datos"""
        if self.conn:
            self.conn.close()
            print("🔒 Conexión cerrada")
    
    def listar_productos(self, limit: int = 50):
        """
        Lista todos los productos en el inventario
        
        Args:
            limit: Número máximo de productos a mostrar
        """
        try:
            query = """
                SELECT id, nombre, codigo_barras, precio, stock_actual, 
                       stock_minimo, categoria, ubicacion 
                FROM productos 
                ORDER BY nombre 
                LIMIT ?
            """
            self.cursor.execute(query, (limit,))
            productos = self.cursor.fetchall()
            
            if not productos:
                print("📦 No hay productos en el inventario")
                return
            
            print(f"\n📦 INVENTARIO DE PRODUCTOS (mostrando {len(productos)} productos)\n")
            print("-" * 120)
            print(f"{'ID':<5} {'Nombre':<30} {'Código':<15} {'Precio':<10} {'Stock':<8} {'Min':<6} {'Categoría':<15} {'Ubicación':<15}")
            print("-" * 120)
            
            for producto in productos:
                id_prod, nombre, codigo, precio, stock, stock_min, cat, ubic = producto
                # Alerta visual si stock bajo
                alerta = "⚠️ " if stock <= stock_min else "   "
                print(f"{alerta}{id_prod:<5} {nombre[:28]:<30} {codigo or 'N/A':<15} ${precio:<9.2f} {stock:<8} {stock_min:<6} {cat or 'N/A':<15} {ubic or 'N/A':<15}")
            
            print("-" * 120)
            
        except sqlite3.Error as e:
            print(f"❌ Error al listar productos: {e}")
    
    def buscar_producto(self, termino: str):
        """
        Busca productos por nombre, código de barras o descripción
        
        Args:
            termino: Término de búsqueda
        """
        try:
            query = """
                SELECT id, nombre, descripcion, codigo_barras, precio, 
                       stock_actual, stock_minimo, categoria, ubicacion, proveedor
                FROM productos 
                WHERE nombre LIKE ? OR codigo_barras LIKE ? OR descripcion LIKE ?
            """
            termino_busqueda = f"%{termino}%"
            self.cursor.execute(query, (termino_busqueda, termino_busqueda, termino_busqueda))
            productos = self.cursor.fetchall()
            
            if not productos:
                print(f"🔍 No se encontraron productos con '{termino}'")
                return
            
            print(f"\n🔍 RESULTADOS DE BÚSQUEDA: '{termino}' ({len(productos)} encontrados)\n")
            
            for producto in productos:
                id_prod, nombre, desc, codigo, precio, stock, stock_min, cat, ubic, prov = producto
                alerta = "⚠️  STOCK BAJO" if stock <= stock_min else "✅ Stock OK"
                
                print("-" * 80)
                print(f"ID: {id_prod}")
                print(f"Nombre: {nombre}")
                print(f"Descripción: {desc or 'Sin descripción'}")
                print(f"Código de barras: {codigo or 'N/A'}")
                print(f"Precio: ${precio:.2f}")
                print(f"Stock actual: {stock} | Stock mínimo: {stock_min} | {alerta}")
                print(f"Categoría: {cat or 'N/A'}")
                print(f"Ubicación: {ubic or 'N/A'}")
                print(f"Proveedor: {prov or 'N/A'}")
            
            print("-" * 80)
            
        except sqlite3.Error as e:
            print(f"❌ Error al buscar productos: {e}")
    
    def agregar_producto(self, nombre: str, precio: float, stock: int = 0,
                        codigo_barras: Optional[str] = None,
                        descripcion: Optional[str] = None,
                        stock_minimo: int = 10,
                        categoria: Optional[str] = None,
                        ubicacion: Optional[str] = None,
                        proveedor: Optional[str] = None):
        """
        Agrega un nuevo producto al inventario
        
        Args:
            nombre: Nombre del producto
            precio: Precio del producto
            stock: Stock inicial
            codigo_barras: Código de barras del producto
            descripcion: Descripción del producto
            stock_minimo: Stock mínimo antes de alertar
            categoria: Categoría del producto
            ubicacion: Ubicación en la tienda
            proveedor: Nombre del proveedor
        """
        try:
            query = """
                INSERT INTO productos 
                (nombre, descripcion, codigo_barras, precio, stock_actual, 
                 stock_minimo, categoria, ubicacion, proveedor)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            self.cursor.execute(query, (
                nombre, descripcion, codigo_barras, precio, stock,
                stock_minimo, categoria, ubicacion, proveedor
            ))
            self.conn.commit()
            
            producto_id = self.cursor.lastrowid
            print(f"✅ Producto agregado exitosamente con ID: {producto_id}")
            print(f"   Nombre: {nombre}")
            print(f"   Precio: ${precio:.2f}")
            print(f"   Stock inicial: {stock}")
            
        except sqlite3.IntegrityError as e:
            print(f"❌ Error: El código de barras ya existe en el sistema")
        except sqlite3.Error as e:
            print(f"❌ Error al agregar producto: {e}")
    
    def actualizar_stock(self, producto_id: int, nuevo_stock: int):
        """
        Actualiza el stock de un producto
        
        Args:
            producto_id: ID del producto
            nuevo_stock: Nuevo valor de stock
        """
        try:
            # Verificar que el producto existe
            self.cursor.execute("SELECT nombre FROM productos WHERE id = ?", (producto_id,))
            resultado = self.cursor.fetchone()
            
            if not resultado:
                print(f"❌ No se encontró producto con ID: {producto_id}")
                return
            
            query = """
                UPDATE productos 
                SET stock_actual = ?, fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE id = ?
            """
            self.cursor.execute(query, (nuevo_stock, producto_id))
            self.conn.commit()
            
            print(f"✅ Stock actualizado para '{resultado[0]}'")
            print(f"   Nuevo stock: {nuevo_stock}")
            
        except sqlite3.Error as e:
            print(f"❌ Error al actualizar stock: {e}")
    
    def stock_bajo(self):
        """Muestra productos con stock bajo (stock actual <= stock mínimo)"""
        try:
            query = """
                SELECT id, nombre, codigo_barras, stock_actual, stock_minimo, 
                       categoria, proveedor
                FROM productos 
                WHERE stock_actual <= stock_minimo
                ORDER BY stock_actual ASC
            """
            self.cursor.execute(query)
            productos = self.cursor.fetchall()
            
            if not productos:
                print("✅ Todos los productos tienen stock suficiente")
                return
            
            print(f"\n⚠️  ALERTA: PRODUCTOS CON STOCK BAJO ({len(productos)} productos)\n")
            print("-" * 100)
            print(f"{'ID':<5} {'Nombre':<30} {'Código':<15} {'Stock':<8} {'Mínimo':<8} {'Categoría':<15} {'Proveedor':<15}")
            print("-" * 100)
            
            for producto in productos:
                id_prod, nombre, codigo, stock, stock_min, cat, prov = producto
                print(f"{id_prod:<5} {nombre[:28]:<30} {codigo or 'N/A':<15} {stock:<8} {stock_min:<8} {cat or 'N/A':<15} {prov or 'N/A':<15}")
            
            print("-" * 100)
            
        except sqlite3.Error as e:
            print(f"❌ Error al consultar stock bajo: {e}")
    
    def registrar_venta(self, producto_id: int, cantidad: int, usuario_id: int = 1):
        """
        Registra una venta y actualiza el inventario
        
        Args:
            producto_id: ID del producto vendido
            cantidad: Cantidad vendida
            usuario_id: ID del usuario que realiza la venta (por defecto 1)
        """
        try:
            # Obtener información del producto
            self.cursor.execute(
                "SELECT nombre, precio, stock_actual FROM productos WHERE id = ?",
                (producto_id,)
            )
            resultado = self.cursor.fetchone()
            
            if not resultado:
                print(f"❌ No se encontró producto con ID: {producto_id}")
                return
            
            nombre, precio, stock_actual = resultado
            
            # Verificar stock disponible
            if stock_actual < cantidad:
                print(f"❌ Stock insuficiente. Disponible: {stock_actual}, Solicitado: {cantidad}")
                return
            
            # Calcular total
            total = precio * cantidad
            
            # Registrar venta
            query_venta = """
                INSERT INTO ventas (producto_id, usuario_id, cantidad, precio_unitario, total)
                VALUES (?, ?, ?, ?, ?)
            """
            self.cursor.execute(query_venta, (producto_id, usuario_id, cantidad, precio, total))
            
            # Actualizar stock
            nuevo_stock = stock_actual - cantidad
            query_stock = """
                UPDATE productos 
                SET stock_actual = ?, fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE id = ?
            """
            self.cursor.execute(query_stock, (nuevo_stock, producto_id))
            
            self.conn.commit()
            
            print(f"✅ Venta registrada exitosamente")
            print(f"   Producto: {nombre}")
            print(f"   Cantidad: {cantidad}")
            print(f"   Precio unitario: ${precio:.2f}")
            print(f"   Total: ${total:.2f}")
            print(f"   Stock restante: {nuevo_stock}")
            
        except sqlite3.Error as e:
            self.conn.rollback()
            print(f"❌ Error al registrar venta: {e}")
    
    def estadisticas(self):
        """Muestra estadísticas generales del sistema"""
        try:
            # Total de productos
            self.cursor.execute("SELECT COUNT(*) FROM productos")
            total_productos = self.cursor.fetchone()[0]
            
            # Valor total del inventario
            self.cursor.execute("SELECT SUM(precio * stock_actual) FROM productos")
            valor_inventario = self.cursor.fetchone()[0] or 0
            
            # Productos con stock bajo
            self.cursor.execute(
                "SELECT COUNT(*) FROM productos WHERE stock_actual <= stock_minimo"
            )
            productos_stock_bajo = self.cursor.fetchone()[0]
            
            # Total de ventas
            self.cursor.execute("SELECT COUNT(*), SUM(total) FROM ventas")
            resultado_ventas = self.cursor.fetchone()
            total_ventas = resultado_ventas[0]
            monto_ventas = resultado_ventas[1] or 0
            
            # Producto más vendido
            self.cursor.execute("""
                SELECT p.nombre, SUM(v.cantidad) as total_vendido
                FROM ventas v
                JOIN productos p ON v.producto_id = p.id
                GROUP BY v.producto_id
                ORDER BY total_vendido DESC
                LIMIT 1
            """)
            mas_vendido = self.cursor.fetchone()
            
            print("\n" + "=" * 60)
            print("📊 ESTADÍSTICAS DEL SISTEMA")
            print("=" * 60)
            print(f"📦 Total de productos: {total_productos}")
            print(f"💰 Valor total del inventario: ${valor_inventario:.2f}")
            print(f"⚠️  Productos con stock bajo: {productos_stock_bajo}")
            print(f"🛒 Total de ventas realizadas: {total_ventas}")
            print(f"💵 Monto total de ventas: ${monto_ventas:.2f}")
            
            if mas_vendido:
                print(f"🏆 Producto más vendido: {mas_vendido[0]} ({mas_vendido[1]} unidades)")
            
            print("=" * 60 + "\n")
            
        except sqlite3.Error as e:
            print(f"❌ Error al obtener estadísticas: {e}")
    
    def eliminar_producto(self, producto_id: int):
        """
        Elimina un producto del inventario
        
        Args:
            producto_id: ID del producto a eliminar
        """
        try:
            # Verificar que el producto existe
            self.cursor.execute("SELECT nombre FROM productos WHERE id = ?", (producto_id,))
            resultado = self.cursor.fetchone()
            
            if not resultado:
                print(f"❌ No se encontró producto con ID: {producto_id}")
                return
            
            # Verificar si tiene ventas asociadas
            self.cursor.execute("SELECT COUNT(*) FROM ventas WHERE producto_id = ?", (producto_id,))
            ventas_count = self.cursor.fetchone()[0]
            
            if ventas_count > 0:
                print(f"⚠️  Advertencia: Este producto tiene {ventas_count} ventas registradas")
                respuesta = input("¿Desea continuar con la eliminación? (s/n): ")
                if respuesta.lower() != 's':
                    print("❌ Operación cancelada")
                    return
            
            query = "DELETE FROM productos WHERE id = ?"
            self.cursor.execute(query, (producto_id,))
            self.conn.commit()
            
            print(f"✅ Producto '{resultado[0]}' eliminado exitosamente")
            
        except sqlite3.Error as e:
            print(f"❌ Error al eliminar producto: {e}")


def main():
    """Función principal que maneja los argumentos de línea de comandos"""
    parser = argparse.ArgumentParser(
        description="🛠️  Tlapalería CLI - Sistema de gestión para tlapalería",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  python tlapaleria_cli.py listar
  python tlapaleria_cli.py buscar "martillo"
  python tlapaleria_cli.py agregar "Martillo" 250.50 --stock 10 --categoria "Herramientas"
  python tlapaleria_cli.py stock-bajo
  python tlapaleria_cli.py venta 1 2
  python tlapaleria_cli.py estadisticas
        """
    )
    
    subparsers = parser.add_subparsers(dest='comando', help='Comandos disponibles')
    
    # Comando: listar
    parser_listar = subparsers.add_parser('listar', help='Lista todos los productos')
    parser_listar.add_argument('--limit', type=int, default=50, help='Número máximo de productos a mostrar')
    
    # Comando: buscar
    parser_buscar = subparsers.add_parser('buscar', help='Busca productos por nombre, código o descripción')
    parser_buscar.add_argument('termino', help='Término de búsqueda')
    
    # Comando: agregar
    parser_agregar = subparsers.add_parser('agregar', help='Agrega un nuevo producto')
    parser_agregar.add_argument('nombre', help='Nombre del producto')
    parser_agregar.add_argument('precio', type=float, help='Precio del producto')
    parser_agregar.add_argument('--stock', type=int, default=0, help='Stock inicial')
    parser_agregar.add_argument('--codigo', help='Código de barras')
    parser_agregar.add_argument('--descripcion', help='Descripción del producto')
    parser_agregar.add_argument('--stock-minimo', type=int, default=10, help='Stock mínimo')
    parser_agregar.add_argument('--categoria', help='Categoría del producto')
    parser_agregar.add_argument('--ubicacion', help='Ubicación en la tienda')
    parser_agregar.add_argument('--proveedor', help='Nombre del proveedor')
    
    # Comando: actualizar-stock
    parser_actualizar = subparsers.add_parser('actualizar-stock', help='Actualiza el stock de un producto')
    parser_actualizar.add_argument('id', type=int, help='ID del producto')
    parser_actualizar.add_argument('stock', type=int, help='Nuevo valor de stock')
    
    # Comando: stock-bajo
    subparsers.add_parser('stock-bajo', help='Muestra productos con stock bajo')
    
    # Comando: venta
    parser_venta = subparsers.add_parser('venta', help='Registra una venta')
    parser_venta.add_argument('producto_id', type=int, help='ID del producto')
    parser_venta.add_argument('cantidad', type=int, help='Cantidad vendida')
    parser_venta.add_argument('--usuario', type=int, default=1, help='ID del usuario')
    
    # Comando: estadisticas
    subparsers.add_parser('estadisticas', help='Muestra estadísticas del sistema')
    
    # Comando: eliminar
    parser_eliminar = subparsers.add_parser('eliminar', help='Elimina un producto')
    parser_eliminar.add_argument('id', type=int, help='ID del producto a eliminar')
    
    args = parser.parse_args()
    
    if not args.comando:
        parser.print_help()
        return
    
    # Crear instancia del CLI
    cli = TlapaleriaCLI()
    
    try:
        if args.comando == 'listar':
            cli.listar_productos(args.limit)
        
        elif args.comando == 'buscar':
            cli.buscar_producto(args.termino)
        
        elif args.comando == 'agregar':
            cli.agregar_producto(
                nombre=args.nombre,
                precio=args.precio,
                stock=args.stock,
                codigo_barras=args.codigo,
                descripcion=args.descripcion,
                stock_minimo=args.stock_minimo,
                categoria=args.categoria,
                ubicacion=args.ubicacion,
                proveedor=args.proveedor
            )
        
        elif args.comando == 'actualizar-stock':
            cli.actualizar_stock(args.id, args.stock)
        
        elif args.comando == 'stock-bajo':
            cli.stock_bajo()
        
        elif args.comando == 'venta':
            cli.registrar_venta(args.producto_id, args.cantidad, args.usuario)
        
        elif args.comando == 'estadisticas':
            cli.estadisticas()
        
        elif args.comando == 'eliminar':
            cli.eliminar_producto(args.id)
        
    finally:
        cli.close()


if __name__ == "__main__":
    main()
