// database.js
import SQLite from 'react-native-sqlite-storage';

export const createDatabase = async () => {
    try {
        const db = await SQLite.openDatabase({ name: 'mysocket.db', location: 'default' });
        console.log('Database created successfully:', db);
        return db; // Return the database object for further usage if needed
    } catch (error) {
        console.error('Error creating database:', error);
        return null; // Return null to indicate failure
    }
};
