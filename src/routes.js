import generalController from './controller/generalController';
import AuthController from './controller/AuthController';
import seedController from './controller/seedController';
import payController from './controller/payController';
import userController from './controller/userController';
import companyController from './controller/companyController';
import supplierController from './controller/supplierController';
import supplierProjectController from './controller/supplierProjectController';
import projectController from './controller/projectController';
import taskController from './controller/taskController';
import budgetController from './controller/budgetController';
import paymentController from './controller/paymentController';
import characterController from './controller/characterController';

import { confirmUserMiddleware } from './middleware';
import register from './middleware/auth/register.middleware';
import login from './middleware/auth/login.middleware';

const routes = (route) => {
	
	route.route('/').get((req, res, next) => {
		res.json({success: true})
	})

	/**
   	* General controller
	*/
	route.route('/imgn/api/v1/list/get').get(generalController.getAllList);
	route.route('/imgn/api/v1/countries').get(confirmUserMiddleware(true), generalController.getCountries);
	route.route('/imgn/api/v1/country/:country_id').get(confirmUserMiddleware(true), generalController.getCountry);

	/**
   	* User controller
	*/
	route.route('/imgn/api/v1/user/register').post(userController.register);
	route.route('/imgn/api/v1/user/login').post(userController.login);
	route.route('/imgn/api/v1/user/update_profile').post(userController.updateProfile);
	route.route('/imgn/api/v1/user/update_profile_project').post(userController.updateProfileProject);
	route.route('/imgn/api/v1/user/verifyEmail').get(userController.verifyEmail);
	route.route('/imgn/api/v1/user/verify').get(userController.verify);
	//route.route('/imgn/api/v1/user/forgotPassword').post(userController.forgotPassword);
	route.route('/imgn/api/v1/user/retrieve-password').post(userController.retrievePassword);
	route.route('/imgn/api/v1/user/confirm-security-code').post(userController.confirmSecurityCode);
	route.route('/imgn/api/v1/user/update-password').post(userController.updatePassword);
	route.route('/imgn/api/v1/user/change-password').post(userController.changePassword);
	route.route('/imgn/api/v1/user/invite').post(userController.inviteUser);
	route.route('/imgn/api/v1/user/project/add').post(userController.projectAdd);
	route.route('/imgn/api/v1/user/project/remove').post(userController.projectRemove);
	route.route('/imgn/api/v1/user/project/edit').put(userController.projectEdit);  // where is your client work folder?
	route.route('/imgn/api/v1/user/acceptInvitation/:company_id/:email/:code').get(userController.acceptInvitation);
	route.route('/imgn/api/v1/user/company/get/:company_id').get(confirmUserMiddleware(true), userController.getAllCompanyUsers);
	route.route('/imgn/api/v1/user/name/get/:user_name').get(confirmUserMiddleware(true), userController.getUserName);
	route.route('/imgn/api/v1/user/notification/fetch').post(confirmUserMiddleware(true), userController.fetchUserNotification);
	route.route('/imgn/api/v1/user/notification/add').post(confirmUserMiddleware(true), userController.addUserNotification);
	route.route('/imgn/api/v1/user/notifications/add').post(confirmUserMiddleware(true), userController.addUserNotifications);
	route.route('/imgn/api/v1/user/notification/delete').delete(confirmUserMiddleware(true), userController.deleteUserNotification);
	route.route('/imgn/api/v1/user/supplier/notification/add').post(confirmUserMiddleware(true), userController.addUserSupplierNotification);
	route.route('/imgn/api/v1/user/file/get/:user_id').get(confirmUserMiddleware(true), userController.getAllUserFiles);
	route.route('/imgn/api/v1/user/file/add').post(confirmUserMiddleware(true), userController.fileAdd);
	route.route('/imgn/api/v1/user/file/delete').delete(confirmUserMiddleware(true), userController.fileDelete);

	/**
   	* Company controller
	*/
	route.route('/imgn/api/v1/company/get').get(confirmUserMiddleware(true), companyController.getAll);
	route.route('/imgn/api/v1/company/get/:company_id').get(confirmUserMiddleware(true), companyController.getCompany);
	route.route('/imgn/api/v1/company/add').post(confirmUserMiddleware(true), companyController.create);
	route.route('/imgn/api/v1/company/delete').delete(confirmUserMiddleware(true), companyController.delete);
	route.route('/imgn/api/v1/company/:company_id').get(confirmUserMiddleware(true), companyController.getCompany);

	/**
   	* Supplier controller
	*/
	route.route('/imgn/api/v1/supplier/get').get(confirmUserMiddleware(true), supplierController.getAll);
	route.route('/imgn/api/v1/supplier/get/:supplier_id').get(confirmUserMiddleware(true), supplierController.getSupplier);
	route.route('/imgn/api/v1/supplier/company/get/:project_id').get(confirmUserMiddleware(true), supplierController.getCompanySuppliers);
	route.route('/imgn/api/v1/supplier/add').post(confirmUserMiddleware(true), supplierController.create);
	route.route('/imgn/api/v1/supplier/delete').delete(confirmUserMiddleware(true), supplierController.delete);
	route.route('/imgn/api/v1/supplier/project/add').post(confirmUserMiddleware(true), supplierProjectController.create);
	route.route('/imgn/api/v1/supplier/project/delete').delete(confirmUserMiddleware(true), supplierProjectController.delete);
	route.route('/imgn/api/v1/suppliers/add').post(confirmUserMiddleware(true), supplierController.createSupplierList);
	route.route('/imgn/api/v1/supplier/file/get/:supplier_id').get(confirmUserMiddleware(true), supplierController.getAllSupplierFiles);
	route.route('/imgn/api/v1/supplier/project/get/:project_id').get(confirmUserMiddleware(true), supplierController.getAllProjectSuppliers);
	route.route('/imgn/api/v1/supplier/file/add').post(confirmUserMiddleware(true), supplierController.fileAdd);
	route.route('/imgn/api/v1/supplier/file/delete').delete(confirmUserMiddleware(true), supplierController.fileDelete);
	route.route('/imgn/api/v1/supplier/category/get/:project_id').get(confirmUserMiddleware(true), supplierController.getSupplierCategory);
	route.route('/imgn/api/v1/supplier/category/add').post(confirmUserMiddleware(true), supplierController.addSupplierCategory);
	route.route('/imgn/api/v1/supplier/category/delete').delete(confirmUserMiddleware(true), supplierController.deleteSupplierCategory);
	route.route('/imgn/api/v1/supplier/type/get').get(confirmUserMiddleware(true), supplierController.getSupplierType);
	route.route('/imgn/api/v1/supplier/type/add').post(confirmUserMiddleware(true), supplierController.addSupplierType);
	route.route('/imgn/api/v1/supplier/type/delete').delete(confirmUserMiddleware(true), supplierController.deleteSupplierType);
	route.route('/imgn/api/v1/supplier/unit/type/get').get(confirmUserMiddleware(true), supplierController.getSupplierUnitType);
	route.route('/imgn/api/v1/supplier/unit/type/add').post(confirmUserMiddleware(true), supplierController.addSupplierUnitType);
	route.route('/imgn/api/v1/supplier/unit/type/delete').delete(confirmUserMiddleware(true), supplierController.deleteSupplierUnitType);
	route.route('/imgn/api/v1/supplier/department/get').get(confirmUserMiddleware(true), supplierController.getSupplierDepartment);
	route.route('/imgn/api/v1/supplier/department/add').post(confirmUserMiddleware(true), supplierController.addSupplierDepartment);
	route.route('/imgn/api/v1/supplier/department/delete').delete(confirmUserMiddleware(true), supplierController.deleteSupplierDepartment);
	route.route('/imgn/api/v1/supplier/job_title/get').get(confirmUserMiddleware(true), supplierController.getSupplierJobTitle);
	route.route('/imgn/api/v1/supplier/job_title/add').post(confirmUserMiddleware(true), supplierController.addSupplierJobTitle);
	route.route('/imgn/api/v1/supplier/job_title/delete').delete(confirmUserMiddleware(true), supplierController.deleteSupplierJobTitle);
	route.route('/imgn/api/v1/supplier/title/get/:project_id').get(confirmUserMiddleware(true), supplierController.getSupplierTitle);
	route.route('/imgn/api/v1/supplier/title/add').post(confirmUserMiddleware(true), supplierController.createSupplierTitle);
	route.route('/imgn/api/v1/supplier/title/delete').delete(confirmUserMiddleware(true), supplierController.deleteSupplierTitle);

	/**
   	* Project controller
	*/
	route.route('/imgn/api/v1/project/get').get(confirmUserMiddleware(true), projectController.getAll);
	route.route('/imgn/api/v1/project/get/:project_id').get(confirmUserMiddleware(true), projectController.getProject);
	route.route('/imgn/api/v1/project/character/get/:project_id').get(confirmUserMiddleware(true), projectController.getProjectCharacter);
	route.route('/imgn/api/v1/project/add').post(confirmUserMiddleware(true), projectController.create);
	route.route('/imgn/api/v1/project/delete').delete(confirmUserMiddleware(true), projectController.delete);
	route.route('/imgn/api/v1/project/company/:company_id/:user_id').get(confirmUserMiddleware(true), projectController.getAllCompanyProjects);
	route.route('/imgn/api/v1/project/file/script/breakdown').post(confirmUserMiddleware(true), projectController.scriptBreakdown);
	route.route('/imgn/api/v1/project/file/get/:project_id').get(confirmUserMiddleware(true), projectController.getAllProjectFiles);
	route.route('/imgn/api/v1/project/file/add').post(confirmUserMiddleware(true), projectController.fileAdd);
	route.route('/imgn/api/v1/project/file/delete').post(confirmUserMiddleware(true), projectController.fileDelete);
	route.route('/imgn/api/v1/project/script/uploaded').delete(confirmUserMiddleware(true), projectController.scriptUploaded);
	route.route('/imgn/api/v1/project/props/get').get(confirmUserMiddleware(true), projectController.getProps);
	route.route('/imgn/api/v1/project/props/add').post(confirmUserMiddleware(true), projectController.addProps);
	route.route('/imgn/api/v1/project/props/delete').delete(confirmUserMiddleware(true), projectController.deleteProps);
	route.route('/imgn/api/v1/project/scene/get/:project_id/:scene_number').get(confirmUserMiddleware(true), projectController.getProjectScene);
	route.route('/imgn/api/v1/project/scene/add').post(confirmUserMiddleware(true), projectController.addProjectScene);
	route.route('/imgn/api/v1/project/scene/task/add').post(confirmUserMiddleware(true), projectController.addProjectSceneTask);
	route.route('/imgn/api/v1/project/scene/delete').delete(confirmUserMiddleware(true), projectController.deleteProjectScene);
	route.route('/imgn/api/v1/project/script/get/:project_id/:chapter_number').get(confirmUserMiddleware(true), projectController.getProjectScript);
	route.route('/imgn/api/v1/project/script/add').post(confirmUserMiddleware(true), projectController.addProjectScript);
	route.route('/imgn/api/v1/project/script/delete/:project_id/:chapter_number').delete(confirmUserMiddleware(true), projectController.deleteProjectScript);
	route.route('/imgn/api/v1/project/shooting/get/:project_id').get(confirmUserMiddleware(true), projectController.getProjectShootingDay);
	route.route('/imgn/api/v1/project/shooting/add').post(confirmUserMiddleware(true), projectController.addProjectShootingDay);
	route.route('/imgn/api/v1/project/shootings/add').post(confirmUserMiddleware(true), projectController.addProjectShootingDays);
	route.route('/imgn/api/v1/project/shooting/pos/add').post(confirmUserMiddleware(true), projectController.addProjectShootingDayPos);
	route.route('/imgn/api/v1/project/shooting/scene/move').post(confirmUserMiddleware(true), projectController.moveProjectShootingDayScene);
	route.route('/imgn/api/v1/project/shooting/delete').delete(confirmUserMiddleware(true), projectController.deleteProjectShootingDay);
	//route.route('/imgn/api/v1/project/shooting/scene/add').post(confirmUserMiddleware(true), projectController.addProjectShootingDayScene);
	//route.route('/imgn/api/v1/project/shooting/scene/delete').delete(confirmUserMiddleware(true), projectController.deleteProjectShootingDayScene);
	route.route('/imgn/api/v1/project/limitation/add').post(confirmUserMiddleware(true), projectController.setProjectLimitation);
	route.route('/imgn/api/v1/project/build/schedule').post(confirmUserMiddleware(true), projectController.buildProjectSchedule);
	route.route('/imgn/api/v1/project/build/reschedule').post(confirmUserMiddleware(true), projectController.buildProjectReschedule);
	route.route('/imgn/api/v1/project/scene/time/get/:project_id').get(confirmUserMiddleware(true), projectController.getSceneTime);
	route.route('/imgn/api/v1/project/scene/time/add').post(confirmUserMiddleware(true), projectController.addSceneTime);
	route.route('/imgn/api/v1/project/scene/time/delete').delete(confirmUserMiddleware(true), projectController.deleteSceneTime);
	route.route('/imgn/api/v1/project/scene/location/get/:project_id').get(confirmUserMiddleware(true), projectController.getSceneLocation);
	route.route('/imgn/api/v1/project/scene/location/add').post(confirmUserMiddleware(true), projectController.addSceneLocation);
	route.route('/imgn/api/v1/project/scene/location/delete').delete(confirmUserMiddleware(true), projectController.deleteSceneLocation);
	route.route('/imgn/api/v1/project/prop/add').post(confirmUserMiddleware(true), projectController.addProjectProp);
	route.route('/imgn/api/v1/project/prop/delete').delete(confirmUserMiddleware(true), projectController.deleteProjectProp);

	/**
   	* Character controller
	*/
	route.route('/imgn/api/v1/character/get').get(confirmUserMiddleware(true), characterController.getAll);
	route.route('/imgn/api/v1/character/get/:character_id').get(confirmUserMiddleware(true), characterController.getCharacter);
	route.route('/imgn/api/v1/character/add').post(confirmUserMiddleware(true), characterController.create);
	route.route('/imgn/api/v1/character/delete').delete(confirmUserMiddleware(true), characterController.delete);
	route.route('/imgn/api/v1/characters/delete').delete(confirmUserMiddleware(true), characterController.delete_characters);
	
	/**
   	* Task controller
	*/
	route.route('/imgn/api/v1/task/get').get(confirmUserMiddleware(true), taskController.getAll);
	route.route('/imgn/api/v1/task/get/:task_id').get(confirmUserMiddleware(true), taskController.getTask);
	route.route('/imgn/api/v1/task/project/get/:project_id').get(confirmUserMiddleware(true), taskController.getProjectTasks);
	route.route('/imgn/api/v1/task/add').post(confirmUserMiddleware(true), taskController.create);
	route.route('/imgn/api/v1/task/delete').delete(confirmUserMiddleware(true), taskController.delete);
	route.route('/imgn/api/v1/tasks/delete').delete(confirmUserMiddleware(true), taskController.deleteTaskList);
	route.route('/imgn/api/v1/tasks/add').post(confirmUserMiddleware(true), taskController.createTaskList);
	route.route('/imgn/api/v1/task/parent/update').put(confirmUserMiddleware(true), taskController.updateParent);
	route.route('/imgn/api/v1/task/project/user/get/:project_id/:with_task').get(confirmUserMiddleware(true), taskController.getAllProjectUsersTask);
	route.route('/imgn/api/v1/task/file/get/:task_id').get(confirmUserMiddleware(true), taskController.getAllTaskFiles);
	route.route('/imgn/api/v1/task/file/add').post(confirmUserMiddleware(true), taskController.fileAdd);
	route.route('/imgn/api/v1/task/file/delete').delete(confirmUserMiddleware(true), taskController.fileDelete);
	route.route('/imgn/api/v1/task/category/get/:supplier_id/:project_id').get(confirmUserMiddleware(true), taskController.getTaskCategory);
	route.route('/imgn/api/v1/task/category/add').post(confirmUserMiddleware(true), taskController.addTaskCategory);
	route.route('/imgn/api/v1/task/category/delete').delete(confirmUserMiddleware(true), taskController.deleteTaskCategory);
	route.route('/imgn/api/v1/task/type/get').get(confirmUserMiddleware(true), taskController.getTaskType);
	route.route('/imgn/api/v1/task/type/add').post(confirmUserMiddleware(true), taskController.addTaskType);
	route.route('/imgn/api/v1/task/type/delete').delete(confirmUserMiddleware(true), taskController.deleteTaskType);
	route.route('/imgn/api/v1/task/status/get').get(confirmUserMiddleware(true), taskController.getTaskStatus);
	route.route('/imgn/api/v1/task/status/add').post(confirmUserMiddleware(true), taskController.addTaskStatus);
	route.route('/imgn/api/v1/task/status/delete').delete(confirmUserMiddleware(true), taskController.deleteTaskStatus);
	route.route('/imgn/api/v1/task/title/get/:project_id').get(confirmUserMiddleware(true), taskController.getTaskTitle);
	route.route('/imgn/api/v1/task/title/add').post(confirmUserMiddleware(true), taskController.createTaskTitle);
	route.route('/imgn/api/v1/task/title/delete').delete(confirmUserMiddleware(true), taskController.deleteTaskTitle);

	/**
   	* Budget controller
	*/
	route.route('/imgn/api/v1/budget/get').get(confirmUserMiddleware(true), budgetController.getAll);
	route.route('/imgn/api/v1/budget/get/:budget_id').get(confirmUserMiddleware(true), budgetController.getBudget);
	route.route('/imgn/api/v1/budget/add').post(confirmUserMiddleware(true), budgetController.create);
	route.route('/imgn/api/v1/budget/delete').delete(confirmUserMiddleware(true), budgetController.delete);
	route.route('/imgn/api/v1/budgets/add').post(confirmUserMiddleware(true), budgetController.createBudgetList);
	route.route('/imgn/api/v1/budget/project/get/:project_id').get(confirmUserMiddleware(true), budgetController.getAllProjectBudgets);
	route.route('/imgn/api/v1/budget/file/get/:budget_id').get(confirmUserMiddleware(true), budgetController.getAllBudgetFiles);
	route.route('/imgn/api/v1/budget/file/add').post(confirmUserMiddleware(true), budgetController.fileAdd);
	route.route('/imgn/api/v1/budget/file/delete').delete(confirmUserMiddleware(true), budgetController.fileDelete);
	route.route('/imgn/api/v1/budget/category/get/:project_id').get(confirmUserMiddleware(true), budgetController.getBudgetCategory);
	route.route('/imgn/api/v1/budget/category/add').post(confirmUserMiddleware(true), budgetController.addBudgetCategory);
	route.route('/imgn/api/v1/budget/category/delete').delete(confirmUserMiddleware(true), budgetController.deleteBudgetCategory);
	route.route('/imgn/api/v1/budget/type/get').get(confirmUserMiddleware(true), budgetController.getBudgetType);
	route.route('/imgn/api/v1/budget/type/add').post(confirmUserMiddleware(true), budgetController.addBudgetType);
	route.route('/imgn/api/v1/budget/type/delete').delete(confirmUserMiddleware(true), budgetController.deleteBudgetType);
	route.route('/imgn/api/v1/budget/status/get').get(confirmUserMiddleware(true), budgetController.getBudgetStatus);
	route.route('/imgn/api/v1/budget/status/add').post(confirmUserMiddleware(true), budgetController.addBudgetStatus);
	route.route('/imgn/api/v1/budget/status/delete').delete(confirmUserMiddleware(true), budgetController.deleteBudgetStatus);
	route.route('/imgn/api/v1/budget/title/get/:project_id').get(confirmUserMiddleware(true), budgetController.getBudgetTitle);
	route.route('/imgn/api/v1/budget/title/add').post(confirmUserMiddleware(true), budgetController.createBudgetTitle);
	route.route('/imgn/api/v1/budget/title/delete').delete(confirmUserMiddleware(true), budgetController.deleteBudgetTitle);

	/**
   	* Payment controller
	*/
	route.route('/imgn/api/v1/payment/project/get/:project_id').get(confirmUserMiddleware(true), paymentController.getProjectPayments);
	route.route('/imgn/api/v1/payment/get/:payment_id').get(confirmUserMiddleware(true), paymentController.getPayment);
	route.route('/imgn/api/v1/payment/add').post(confirmUserMiddleware(true), paymentController.create);
	route.route('/imgn/api/v1/payment/delete').delete(confirmUserMiddleware(true), paymentController.delete);

	/**
   	* Pay controller
	*/
	route.route('/imgn/api/v1/pay/create').post(payController.create);
	route.route('/imgn/api/v1/pay/execute').post(payController.execute);
	route.route('/imgn/api/v1/pay/cancel').get(payController.cancel);
	route.route('/imgn/api/v1/pay/return').get(payController.return);

	//route.route('/imgn/api/v1/seed/:model/:number').get(seedController.seed);
	//route.route('/imgn/api/v1/seed/fillDB').get(seedController.fillDB);
};

export default routes;
