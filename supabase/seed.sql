-- Seed data for Le Grand Transporteur ERP

-- ==========================================
-- Seed vehicles
-- ==========================================
INSERT INTO fleet.vehicles (id, plate_number, type, brand, model, year, chassis_number, acquisition_date, acquisition_value, current_km, status, insurance_expiry, technical_control_expiry)
VALUES
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'TN-4821-AB', 'camion-citerne', 'Mercedes', 'Actros 3341', 2021, 'WDB9340321K123456', '2021-03-15', 85000000, 187420, 'active', '2027-03-15', '2026-09-10'),
  ('b2c3d4e5-f67a-8b9c-0d1e-2f3a4b5c6d7e', 'TN-3356-CD', 'porte-conteneur', 'Volvo', 'FH 460', 2020, 'YV2RT40D2KA123456', '2020-07-01', 78000000, 241100, 'active', '2024-11-20', '2025-11-20'),
  ('c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'TN-7701-EF', 'semi-remorque', 'MAN', 'TGX 26.480', 2019, 'WMA06S234LA123456', '2019-06-15', 68000000, 310800, 'maintenance', '2026-07-01', '2026-07-01'),
  ('d4e5f67a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 'TN-1102-GH', 'camion-citerne', 'Mercedes', 'Arocs 3332', 2022, 'WDB9340322K123456', '2022-05-20', 92000000, 98300, 'active', '2027-05-20', '2027-01-15');

-- ==========================================
-- Seed clients
-- ==========================================
INSERT INTO finance.clients (id, name, email, phone, address, tax_number, credit_limit, currency)
VALUES
  ('c1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'SHELL Sénégal', 'contact@shell.sn', '+221 33 869 00 00', 'Route de Ouakam, Dakar', 'NINEA 0012345', 50000000, 'XOF'),
  ('c2c3d4e5-f67a-8b9c-0d1e-2f3a4b5c6d7e', 'SONACOS', 'info@sonacos.sn', '+221 33 849 12 12', 'Bel-Air, Dakar', 'NINEA 0054321', 30000000, 'XOF'),
  ('c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'TOTAL Énergies', 'contact@total.sn', '+221 33 864 30 30', 'VDN, Dakar', 'NINEA 0089101', 80000000, 'XOF');
