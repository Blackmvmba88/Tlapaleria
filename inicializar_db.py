#!/usr/bin/env python3
"""
Script para inicializar la base de datos con datos de ejemplo
Autor: Iyari Cancino Gomez
Cliente: Jesús Morán
"""

import sqlite3
import os


def inicializar_base_datos():
    """Crea la base de datos y las tablas necesarias"""
    
    # Crear directorio backend si no existe
    os.makedirs('backend', exist_ok=True)
    
    db_path = 'backend/tlapaleria.db'
    
    print("🔧 Inicializando base de datos...")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Crear tabla de productos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            codigo_barras TEXT UNIQUE,
            precio REAL NOT NULL,
            stock_actual INTEGER DEFAULT 0,
            stock_minimo INTEGER DEFAULT 10,
            categoria TEXT,
            ubicacion TEXT,
            proveedor TEXT,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Crear tabla de ventas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ventas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producto_id INTEGER NOT NULL,
            usuario_id INTEGER NOT NULL,
            cantidad INTEGER NOT NULL,
            precio_unitario REAL NOT NULL,
            total REAL NOT NULL,
            fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (producto_id) REFERENCES productos(id)
        )
    ''')
    
    # Crear tabla de usuarios (para compatibilidad)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            google_id TEXT UNIQUE,
            email TEXT UNIQUE NOT NULL,
            nombre TEXT NOT NULL,
            foto TEXT,
            rol TEXT DEFAULT 'trabajador',
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    
    # Verificar si ya hay productos
    cursor.execute('SELECT COUNT(*) FROM productos')
    count = cursor.fetchone()[0]
    
    if count > 0:
        print(f"ℹ️  La base de datos ya contiene {count} productos")
        respuesta = input("¿Desea agregar productos de ejemplo? (s/n): ")
        if respuesta.lower() != 's':
            conn.close()
            print("✅ Base de datos lista")
            return
    
    # Agregar productos de ejemplo
    productos_ejemplo = [
        ("Martillo de carpintero", "Martillo profesional con mango de madera", "7501234567890", 250.50, 20, 10, "Herramientas", "Pasillo A1", "Ferretería Nacional"),
        ("Pintura blanca 1L", "Pintura vinílica blanca para interiores", "7501234567891", 180.00, 8, 10, "Pinturas", "Pasillo B2", "Pinturas del Norte"),
        ("Clavos 3 pulgadas (caja)", "Caja con 100 clavos de acero de 3 pulgadas", "7501234567892", 45.50, 30, 10, "Ferretería", "Pasillo A3", "Ferretería Nacional"),
        ("Desarmador Phillips", "Desarmador de cruz profesional", "7501234567893", 85.00, 15, 10, "Herramientas", "Pasillo A1", "Herramientas México"),
        ("Brocha 3 pulgadas", "Brocha para pintura de alta calidad", "7501234567894", 65.00, 12, 10, "Pinturas", "Pasillo B2", "Pinturas del Norte"),
        ("Tornillos para madera (caja)", "Caja con 50 tornillos para madera", "7501234567895", 38.00, 25, 15, "Ferretería", "Pasillo A3", "Ferretería Nacional"),
        ("Cinta métrica 5m", "Cinta métrica retráctil de 5 metros", "7501234567896", 95.00, 10, 10, "Herramientas", "Pasillo A1", "Herramientas México"),
        ("Thinner 1L", "Solvente para diluir pinturas", "7501234567897", 75.00, 18, 10, "Pinturas", "Pasillo B2", "Pinturas del Norte"),
        ("Lija grano 100 (paquete)", "Paquete de 5 lijas de grano 100", "7501234567898", 28.00, 5, 10, "Ferretería", "Pasillo A4", "Ferretería Nacional"),
        ("Sierra para madera", "Sierra manual para corte de madera", "7501234567899", 145.00, 8, 10, "Herramientas", "Pasillo A1", "Herramientas México"),
    ]
    
    print("\n📦 Agregando productos de ejemplo...")
    
    for producto in productos_ejemplo:
        try:
            cursor.execute('''
                INSERT INTO productos 
                (nombre, descripcion, codigo_barras, precio, stock_actual, stock_minimo, 
                 categoria, ubicacion, proveedor)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', producto)
            print(f"  ✓ {producto[0]}")
        except sqlite3.IntegrityError:
            print(f"  ⚠️  {producto[0]} ya existe")
    
    conn.commit()
    conn.close()
    
    print("\n✅ Base de datos inicializada correctamente")
    print(f"📍 Ubicación: {db_path}")
    print("\n💡 Ahora puedes usar la CLI:")
    print("   python3 tlapaleria_cli.py listar")
    print("   python3 tlapaleria_cli.py estadisticas")


if __name__ == "__main__":
    inicializar_base_datos()
