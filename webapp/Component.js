sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"pabz/me/CaricamentoDocumentazioneMobilitaElettrica/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("pabz.me.CaricamentoDocumentazioneMobilitaElettrica.Component", {

			metadata: {
				manifest: "json"
			},

			/**
			 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
			 * @public
			 * @override
			 */
			init: function () {
				// call the base component's init function
				UIComponent.prototype.init.apply(this, arguments);

				// enable routing
				this.getRouter().initialize();

				// set the device model
				this.setModel(models.createDeviceModel(), "device");
				
				//parti aggiuntive nel component riguardanti la lettura dell'empty model e dei dati relativi alle istanze del wf
				// get WF task data ---> solo se richiamato nella inbox

			this.taskId = null;
				
			if (this.getComponentData() !== undefined) {
				var startupParameters = this.getComponentData().startupParameters;	//lettura dell'url iniziale relativo all'istanza del wf.
				var taskModel = startupParameters.taskModel;
				var taskData = taskModel.getData();
				this.taskId = taskData.InstanceID;
				this.instanceId = sap.ui.controller("pabz.me.CaricamentoDocumentazioneMobilitaElettrica.controller.View1").getInstanceId(this.taskId);

				//add actions ---> valido solo nella inbox => andranno aggiunte direttamente nell'applicazione 
				startupParameters.inboxAPI.addAction({
					action: "Confirm",
					label: "Conferma"
				}, function (button) {
					sap.ui.controller("pabz.me.CaricamentoDocumentazioneMobilitaElettrica.controller.View1").onConfirm();
					this._refreshTask();
				}, this);
				startupParameters.inboxAPI.addAction({
					action: "Save",
					label: "Salva Bozza"
				}, function (button) {
					sap.ui.controller("pabz.me.CaricamentoDocumentazioneMobilitaElettrica.controller.View1").onSave();
					this._refreshTask();
				}, this);

			} else {

				this.instanceId = sap.ui.controller("pabz.me.CaricamentoDocumentazioneMobilitaElettrica.controller.View1").getInstanceIdParam();
				this.taskId = sap.ui.controller("pabz.me.CaricamentoDocumentazioneMobilitaElettrica.controller.View1").getTaskId(this.instanceId);

			}

			// initialize WF model

			if (this.instanceId === null) {

				// creo nuovo wf	
				var sPath = "model/emptyModel.json";
				this.setModel(new sap.ui.model.json.JSONModel(sPath));

			} else {

				// carico dati wf. Lettura della istanza del wf
				
				var contextModel = new sap.ui.model.json.JSONModel("/bpmworkflowruntime/rest/v1/task-instances/" + this.taskId + "/context");
				contextModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
				this.setModel(contextModel);
			}

		},

		_refreshTask: function () {
			this.getComponentData().startupParameters.inboxAPI.updateTask("NA", this.taskId);
		}
	});
});