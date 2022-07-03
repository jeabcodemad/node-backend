const express = require('express');
const router = express.Router();

const packageGroupController = require('../controllers/packageGroup');
// list
router.get('/', packageGroupController.packageGroups);
router.get('/:id', packageGroupController.packageGroup);
router.post('/', packageGroupController.addPackageGroup);
router.put('/:id', packageGroupController.updatePackageGroup);
router.delete('/:id', packageGroupController.deletePackageGroup);
router.get('/testinggroup/:id', packageGroupController.packageGroupsByTestingGroupId);

module.exports = router;