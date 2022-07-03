const express = require('express');
const router = express.Router();

const rolesController = require('../controllers/roles');

router.get('/', rolesController.roles);
router.get('/:id', rolesController.role);
router.post('/addRole', rolesController.addRole);
router.put('/:id', rolesController.updateRole);
router.delete('/:id', rolesController.deleteRole);


module.exports = router;

