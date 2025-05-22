import express from 'express';
const router = express.Router();
import client from '../../routes/clients';
router.use('/', client);

 

export default router;