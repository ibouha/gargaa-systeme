const { pool } = require('../src/config/database');

const createTable = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to database');

    const createQuery = `
      CREATE TABLE IF NOT EXISTS chauffeurs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom_complet VARCHAR(100) NOT NULL,
        telephone VARCHAR(20) NOT NULL,
        adresse TEXT,
        permis VARCHAR(50),
        date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actif BOOLEAN DEFAULT TRUE,
        INDEX idx_nom (nom_complet),
        INDEX idx_telephone (telephone)
      ) ENGINE=InnoDB;
    `;

    await connection.query(createQuery);
    console.log('✅ Table "chauffeurs" created successfully');
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
};

createTable();
