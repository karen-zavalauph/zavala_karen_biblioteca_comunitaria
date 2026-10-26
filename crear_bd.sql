BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "Autor" (
	"id"	INTEGER,
	"nombre_autor"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS Ejemplar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    libro_id INTEGER NOT NULL,
    codigo TEXT NOT NULL UNIQUE,
    estado TEXT NOT NULL
        CHECK (estado IN ('disponible', 'prestado', 'dañado')),
    FOREIGN KEY (libro_id) REFERENCES Libro(id)
);
CREATE TABLE IF NOT EXISTS "Lector" (
	"id"	INTEGER,
	"nombre"	TEXT NOT NULL,
	"identificacion"	TEXT NOT NULL UNIQUE,
	"telefono"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS Libro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    ISBN TEXT NOT NULL UNIQUE,
    autor_id INTEGER NOT NULL,
    categoria TEXT NOT NULL,
    anio INTEGER NOT NULL CHECK (anio > 0),
    editorial TEXT NOT NULL,
    FOREIGN KEY (autor_id) REFERENCES Autor(id)
);
CREATE TABLE IF NOT EXISTS Multa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prestamo_id INTEGER NOT NULL UNIQUE,
    monto REAL NOT NULL CHECK (monto > 0),
    pagada TEXT NOT NULL DEFAULT 'no'
        CHECK (pagada IN ('si', 'no')),
    FOREIGN KEY (prestamo_id) REFERENCES Prestamo(id)
);
CREATE TABLE IF NOT EXISTS "Prestamo" (
	"id"	INTEGER,
	"ejemplar_id"	INTEGER NOT NULL,
	"lector_id"	INTEGER NOT NULL,
	"fecha_prestamo"	TEXT NOT NULL,
	"fecha_limite"	TEXT NOT NULL,
	"fecha_devolucion"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("ejemplar_id") REFERENCES "Ejemplar"("id"),
	FOREIGN KEY("lector_id") REFERENCES "Lector"("id"),
	CHECK(fecha_limite>= fecha_prestamo),
	CHECK(fecha_devolucion IS NULL OR fecha_devolucion >= fecha_prestamo)
);
INSERT INTO "Autor" ("id","nombre_autor") VALUES (1,'Gabriel García Márquez');
INSERT INTO "Autor" ("id","nombre_autor") VALUES (2,'Robert Louis Stevenson');
INSERT INTO "Autor" ("id","nombre_autor") VALUES (3,'Mark Twain');
INSERT INTO "Autor" ("id","nombre_autor") VALUES (4,'J.K. Rowling');
INSERT INTO "Autor" ("id","nombre_autor") VALUES (5,'Agatha Christie');
INSERT INTO "Autor" ("id","nombre_autor") VALUES (6,'Isabel Allende');
INSERT INTO "Autor" ("id","nombre_autor") VALUES (7,'Ernesto Sabato');
INSERT INTO "Autor" ("id","nombre_autor") VALUES (8,'Fiodor Dostoyewsky');
INSERT INTO "Autor" ("id","nombre_autor") VALUES (9,'H. G. Wells');
INSERT INTO "Autor" ("id","nombre_autor") VALUES (10,'J. R. R. Tolkien');
INSERT INTO "Ejemplar" ("id","libro_id","codigo","estado") VALUES (1,1,'RM-001','disponible');
INSERT INTO "Ejemplar" ("id","libro_id","codigo","estado") VALUES (2,2,'A-002','prestado');
INSERT INTO "Ejemplar" ("id","libro_id","codigo","estado") VALUES (3,3,'A-003','prestado');
INSERT INTO "Ejemplar" ("id","libro_id","codigo","estado") VALUES (4,4,'F-004','dañado');
INSERT INTO "Ejemplar" ("id","libro_id","codigo","estado") VALUES (5,5,'P-005','disponible');
INSERT INTO "Ejemplar" ("id","libro_id","codigo","estado") VALUES (6,6,'RM-006','disponible');
INSERT INTO "Ejemplar" ("id","libro_id","codigo","estado") VALUES (7,7,'EX-007','prestado');
INSERT INTO "Ejemplar" ("id","libro_id","codigo","estado") VALUES (8,8,'CF-008','dañado');
INSERT INTO "Ejemplar" ("id","libro_id","codigo","estado") VALUES (9,9,'PSI-009','disponible');
INSERT INTO "Ejemplar" ("id","libro_id","codigo","estado") VALUES (10,10,'F-010','disponible');
INSERT INTO "Lector" ("id","nombre","identificacion","telefono") VALUES (1,'Edward Zavala','0313200800056','9856733');
INSERT INTO "Lector" ("id","nombre","identificacion","telefono") VALUES (2,'Magdalena Santos','031320097487585','86988785');
INSERT INTO "Lector" ("id","nombre","identificacion","telefono") VALUES (3,'Lucas Sánchez','084747757758','997664765');
INSERT INTO "Lector" ("id","nombre","identificacion","telefono") VALUES (4,'María Flores','098675467653','685775775');
INSERT INTO "Lector" ("id","nombre","identificacion","telefono") VALUES (5,'Francisco López','0866456747','9008656');
INSERT INTO "Lector" ("id","nombre","identificacion","telefono") VALUES (6,'Miguel Castillo','087556345455','99763567');
INSERT INTO "Lector" ("id","nombre","identificacion","telefono") VALUES (7,'Juan Martínez','9654656567575','8776756454');
INSERT INTO "Lector" ("id","nombre","identificacion","telefono") VALUES (8,'Ana González','04050686866','9873543');
INSERT INTO "Lector" ("id","nombre","identificacion","telefono") VALUES (9,'Sofía Maldonado','0976565758484','90996555');
INSERT INTO "Lector" ("id","nombre","identificacion","telefono") VALUES (10,'Diego Morales','098784565755','97868575');
INSERT INTO "Libro" ("id","titulo","ISBN","autor_id","categoria","anio","editorial") VALUES (1,'Cien años de soledad','ISBN-978001',1,'realismo mágico',2004,'Debolsillo');
INSERT INTO "Libro" ("id","titulo","ISBN","autor_id","categoria","anio","editorial") VALUES (2,'La Isla del Tesoro','ISBN-976009',2,'aventura',1870,'Alba');
INSERT INTO "Libro" ("id","titulo","ISBN","autor_id","categoria","anio","editorial") VALUES (3,'Las aventuras de Tom Sawyer','ISBN-978567',3,'Aventura',1830,'Penguin');
INSERT INTO "Libro" ("id","titulo","ISBN","autor_id","categoria","anio","editorial") VALUES (4,'Harry Potter y la cámara secreta','ISBN-9783456',4,'fantasía',1991,'Salamandra');
INSERT INTO "Libro" ("id","titulo","ISBN","autor_id","categoria","anio","editorial") VALUES (5,'Diez Negritos','ISBN-978340',5,'Policíaco',1910,'Booket');
INSERT INTO "Libro" ("id","titulo","ISBN","autor_id","categoria","anio","editorial") VALUES (6,'La casa de los espíritus','978-5237',6,'realismo mágico',1980,'Plaza Janes');
INSERT INTO "Libro" ("id","titulo","ISBN","autor_id","categoria","anio","editorial") VALUES (7,'El túnel','978-0975',7,'existencialista',1948,'Cátedra');
INSERT INTO "Libro" ("id","titulo","ISBN","autor_id","categoria","anio","editorial") VALUES (8,'La máquina del tiempo','978-00078',9,'Ciencia ficción',1890,'Alba');
INSERT INTO "Libro" ("id","titulo","ISBN","autor_id","categoria","anio","editorial") VALUES (9,'Crimen y castigo','978-3456',8,'Psicológica',1840,'Penguin');
INSERT INTO "Libro" ("id","titulo","ISBN","autor_id","categoria","anio","editorial") VALUES (10,'El señor de los anillos','878-6789',10,'Fantasía',1935,'Minotauro');
INSERT INTO "Multa" ("id","prestamo_id","monto","pagada") VALUES (1,3,125.0,'no');
INSERT INTO "Multa" ("id","prestamo_id","monto","pagada") VALUES (2,10,145.0,'si');
INSERT INTO "Multa" ("id","prestamo_id","monto","pagada") VALUES (3,6,40.0,'si');
INSERT INTO "Multa" ("id","prestamo_id","monto","pagada") VALUES (4,4,790.0,'no');
INSERT INTO "Prestamo" ("id","ejemplar_id","lector_id","fecha_prestamo","fecha_limite","fecha_devolucion") VALUES (1,1,5,'2026-09-08','2026-09-30','2026-09-28');
INSERT INTO "Prestamo" ("id","ejemplar_id","lector_id","fecha_prestamo","fecha_limite","fecha_devolucion") VALUES (2,2,8,'2026-10-02','2026-10-30','2026-11-06');
INSERT INTO "Prestamo" ("id","ejemplar_id","lector_id","fecha_prestamo","fecha_limite","fecha_devolucion") VALUES (3,3,10,'2026-09-02','2026-09-30',NULL);
INSERT INTO "Prestamo" ("id","ejemplar_id","lector_id","fecha_prestamo","fecha_limite","fecha_devolucion") VALUES (4,4,5,'2026-05-11','2026-05-20',NULL);
INSERT INTO "Prestamo" ("id","ejemplar_id","lector_id","fecha_prestamo","fecha_limite","fecha_devolucion") VALUES (5,5,9,'2026-10-24','2026-11-05',NULL);
INSERT INTO "Prestamo" ("id","ejemplar_id","lector_id","fecha_prestamo","fecha_limite","fecha_devolucion") VALUES (6,6,3,'2026-09-14','2026-10-15','2026-10-23');
INSERT INTO "Prestamo" ("id","ejemplar_id","lector_id","fecha_prestamo","fecha_limite","fecha_devolucion") VALUES (7,7,2,'2026-08-05','2026-09-03','2026-08-10');
INSERT INTO "Prestamo" ("id","ejemplar_id","lector_id","fecha_prestamo","fecha_limite","fecha_devolucion") VALUES (8,8,1,'2026-09-08','2026-10-02','2026-10-02');
INSERT INTO "Prestamo" ("id","ejemplar_id","lector_id","fecha_prestamo","fecha_limite","fecha_devolucion") VALUES (9,9,6,'2026-10-03','2026-11-02',NULL);
INSERT INTO "Prestamo" ("id","ejemplar_id","lector_id","fecha_prestamo","fecha_limite","fecha_devolucion") VALUES (10,10,7,'2026-08-03','2026-09-02','2026-10-01');
COMMIT;
