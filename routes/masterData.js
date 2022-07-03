const express = require('express');
const router = express.Router();

const masterDataController = require('../controllers/masterData');

router.get('/testinggroups', masterDataController.testingGroups);
router.get('/labgroups', masterDataController.labGroups);
router.get('/checkinggroups', masterDataController.checkingGroups);
router.get('/packagegroups/:checkinggroupid', masterDataController.packageGroups);
router.get('/labtypes', masterDataController.labTypes);
router.get('/provinces', masterDataController.provinces);
router.get('/amphurs/:provinceId', masterDataController.amphurs);
router.get('/tumbols/:amphurId', masterDataController.tumbols);
router.get('/customertypes', masterDataController.customerTypes);

router.get('/quotationreturns', masterDataController.quotationReturns);
router.get('/quotationsents', masterDataController.quotationSents);
router.get('/quotationpayments', masterDataController.quotationPayments);
router.get('/quotationtypes/:typeid', masterDataController.quotationTypes);
router.get('/remarks', masterDataController.remarks);
router.get('/customers/:typeid', masterDataController.getCustomersByType);

router.get('/sampleconditions', masterDataController.getSampleCondition);
router.get('/references', masterDataController.getReference);
router.get('/reporttypes', masterDataController.getReportType);

module.exports = router;