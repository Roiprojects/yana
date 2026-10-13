import db, {
  pool,
  query,
  queryStrict,
  testDatabaseConnection,
  pingDb,
  hasDb,
  closeDb,
  DatabaseUnavailableError,
} from "../../server/db.js";

export {
  pool,
  query,
  queryStrict,
  testDatabaseConnection,
  pingDb,
  hasDb,
  closeDb,
  DatabaseUnavailableError,
};

export default db;
