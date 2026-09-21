sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "ccb/org/certingresosret/service/BackendService"
], (Controller, JSONModel, MessageBox, BackendService) => {
    "use strict";

    return Controller.extend("ccb.org.certingresosret.controller.Viewini", {
        onInit() {
            this._oBackendService = new BackendService();

            // Datos del empleado logueado (correo) desde el modelo global
            var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");

            // Modelo local del formulario (Otro Numero de personal)
            var oViewiniModel = new JSONModel({
                otroPernr: ""
            });
            this.getView().setModel(oViewiniModel, "viewiniView");
        },

        /**
         * Maneja el evento "liveChange" del campo "Otro Numero de personal":
         * solo permite dígitos y limita la longitud a 8 posiciones.
         */
        onOtroPernrLiveChange(oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oEvent.getParameter("value") || "";
            var sSanitized = sValue.replace(/[^0-9]/g, "").slice(0, 8);

            if (sSanitized !== sValue) {
                oInput.setValue(sSanitized);
            }

            this.getView().getModel("viewiniView").setProperty("/otroPernr", sSanitized);
        },

        /**
         * Determina el número de personal a utilizar para generar el
         * certificado: si el usuario tiene permiso (globalData>/userData/d/
         * TienePermiso = true) y diligenció un valor numérico > 0 en "Otro
         * Numero de personal", se usa ese valor; de lo contrario se usa el
         * Pernr del empleado logueado.
         * @private
         */
        _getPernrConsulta() {
            var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
            var oViewiniModel = this.getView().getModel("viewiniView");

            var bTienePermiso = oGlobalDataModel.getProperty("/userData/d/TienePermiso") === true;
            var sOtroPernr = oViewiniModel.getProperty("/otroPernr");
            var nOtroPernr = parseInt(sOtroPernr, 10);

            if (bTienePermiso && sOtroPernr && nOtroPernr > 0) {
                return sOtroPernr;
            }

            return oGlobalDataModel.getProperty("/userData/d/Pernr");
        },

        /**
         * Genera (abre) el Certificado de Ingresos y Retenciones (CIR) del
         * empleado logueado (o del número de personal diligenciado en "Otro
         * Numero de personal", si aplica) para el Año seleccionado en el formulario.
         */
        onGenerar() {
            var sPernr = this._getPernrConsulta();

            var oSelectAnio = this.getView().byId("selAnio");
            var sAnio = oSelectAnio.getSelectedKey();

            if (!sPernr) {
                MessageBox.error("No se han cargado los datos del empleado. Intente recargar la aplicación.");
                return;
            }

            if (!sAnio) {
                MessageBox.warning("Seleccione un Año antes de generar el certificado.");
                return;
            }

            this._oBackendService.getCertificadoCingRet({
                Pernr: sPernr,
                Anio: sAnio
            }).then((oBlob) => {
                var sBlobUrl = URL.createObjectURL(oBlob);
                window.open(sBlobUrl, "_blank");
            }).catch((oError) => {
                MessageBox.error(oError.message || "No fue posible generar el certificado.");
            });
        }
    });
});
