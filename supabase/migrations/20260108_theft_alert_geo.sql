-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;

-- Add geographic location columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_known_lat double precision;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_known_lng double precision;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location geography(POINT);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token text;

-- Add geographic location column to vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS location geography(POINT);

-- Function to update location geography from lat/lng
CREATE OR REPLACE FUNCTION update_location_geog()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_known_lat IS NOT NULL AND NEW.last_known_lng IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_Point(NEW.last_known_lng, NEW.last_known_lat), 4326)::geography;
  ELSE
    NEW.location := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
DROP TRIGGER IF EXISTS tr_update_profile_location ON profiles;
CREATE TRIGGER tr_update_profile_location
BEFORE INSERT OR UPDATE OF last_known_lat, last_known_lng ON profiles
FOR EACH ROW EXECUTE FUNCTION update_location_geog();

-- Trigger for vehicles
DROP TRIGGER IF EXISTS tr_update_vehicle_location ON vehicles;
CREATE TRIGGER tr_update_vehicle_location
BEFORE INSERT OR UPDATE OF last_known_lat, last_known_lng ON vehicles
FOR EACH ROW EXECUTE FUNCTION update_location_geog();

-- RPC function to filter profiles by distance
CREATE OR REPLACE FUNCTION get_profiles_within_radius(t_lng double precision, t_lat double precision, radius_meters double precision)
RETURNS TABLE (id uuid, push_token text) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.push_token
  FROM profiles p
  WHERE p.push_token IS NOT NULL
  AND ST_DWithin(
    p.location,
    ST_SetSRID(ST_Point(t_lng, t_lat), 4326)::geography,
    radius_meters
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
