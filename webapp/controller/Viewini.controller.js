sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "ccb/org/certingresosret/service/BackendService"
], (Controller, MessageBox, BackendService) => {
    "use strict";

    return Controller.extend("ccb.org.certingresosret.controller.Viewini", {
        onInit() {
            this._oBackendService = new BackendService();

            // Datos del empleado logueado (correo) desde el modelo global
            var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
        },

        /**
         * Genera (abre) el Certificado de Ingresos y Retenciones (CIR) del
         * empleado logueado para el Año seleccionado en el formulario.
         */
        onGenerar() {
            var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
            var sPernr = oGlobalDataModel.getProperty("/userData/d/Pernr");

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

            var sUrl = this._oBackendService.getCertificadoCirUrl({
                Pernr: sPernr,
                Anio: sAnio
            });

            window.open(sUrl, "_blank");
        }
    });
});
