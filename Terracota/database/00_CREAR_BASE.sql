-- Ejecutar una sola vez conectado a la base administrativa "postgres".
-- Después cambia la conexión de la extensión a la base "terracota".

CREATE DATABASE terracota
  WITH
  ENCODING = 'UTF8'
  TEMPLATE = template0;
