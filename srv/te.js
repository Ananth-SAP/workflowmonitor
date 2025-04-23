sap.ui.define(["com/sap/spa/monitorworkflow/controller/BaseMaster", "com/sap/spa/monitorworkflow/model/Models", "com/sap/spa/monitorworkflow/utils/ErrorHandlers", "com/sap/spa/monitorworkflow/utils/i18n", "com/sap/spa/monitorworkflow/controller/utils/MasterUtils", "com/sap/spa/monitorworkflow/controller/utils/SPAUtils", "sap/ui/model/json/JSONModel", "sap/m/Token", "sap/m/Tokenizer"], function (e, t, i, a, s, r, l, n, o) {
    "use strict";
    const d = Object.freeze({
        STATUS: "status",
        INSTANCE: "instance",
        PROJECT: "project",
        DEFNITION: "definition",
        ENVIRONMENT: "environment",
        STARTEDBY: "startedBy",
        INSTANCESID: "instancesId"
    });
    var c = true;
    var g = true;
    return e.extend("com.sap.spa.monitorworkflow.controller.InstancesMaster", {
        onInit: function () {
            s.onInit(this, "InstancesMaster", "workflowInstances", "workflowInstanceWithId");
            sap.ui.getCore().getEventBus().subscribe("InstancesDetailsInitCallBack", "ShowInstanceDetails", this._showInstanceDetails, this);
            this.getView().byId("projectMultiComboBox").setFilterFunction(function (e, t) {
                return s.setCaseInsensitiveFilterSearchFunction(e, t)
            });
            this.getView().byId("definitionsMultiComboBox").setFilterFunction(function (e, t) {
                return s.setCaseInsensitiveFilterSearchFunction(e, t)
            });
            var e = this._getRouter();
            e.getRoute("workflowInstances").attachPatternMatched(this.handleRouteMatched, this);
            this.oFilterBar = this.getView().byId("filterbar");
            this.getFiltersWithValues = this.getFiltersWithValues.bind(this);
            this.oFilterBar.registerGetFiltersWithValues(this.getFiltersWithValues);
            this.applyData = this.applyData.bind(this);
            this.fetchData = this.fetchData.bind(this);
            this.oFilterBar.registerFetchData(this.fetchData);
            this.oFilterBar.registerApplyData(this.applyData);
            this.oFilterBar._oClearButtonOnFB.setText("");
            this.oFilterBar._oClearButtonOnFB.setIcon("sap-icon://clear-filter");
            this.oFilterBar._oClearButtonOnFB.setTooltip(a.getText("TOOLTIP_INSTANCES_CLEAR_FILTER"));
            var i = new sap.m.SearchField({
                id: "masterInstancesFilterSearchFieldfb",
                search: this.onSearchInstances.bind(this),
                value: "{view>/filter/instancesList}",
                change: this.onSearchInstances.bind(this),
                placeholder: a.getText("SEARCH_FIELD_PLACEHOLDER")
            });
            var r = new sap.ui.core.CustomData({
                key: "help-id",
                value: "MonitorWorkflows-masterInstancesFilterSearchField",
                writeToDom: true
            });
            i.addStyleClass("sapUiSizeCompact");
            i.addCustomData(r);
            this.oFilterBar.setBasicSearch(i);
            this._initMultiInputModel("startedByMultiInputBoxfb");
            this._initMultiInputModel("instancesIdMultiInputBoxfb");
            this._handleMultiInputForRouteMatch();
            t.updateEnvironmentsForInstanceFilter()
        },
        handleRouteMatched: function (e) {
            var i = t.getViewModel().getProperty("/filterModel/instancesFilter/categories/startedAfter/actual");
            this.getView().byId("startedAfterDateTimePickerfb").setValue(i);
            var a = t.getViewModel().getProperty("/filterModel/instancesFilter/categories/startedBefore/actual");
            this.getView().byId("startedBeforeDateTimePickerfb").setValue(a);
            var s = t.getViewModel().getProperty("/filterModel/instancesFilter/categories/completedAfter/actual");
            this.getView().byId("completedAfterDateTimePickerfb").setValue(s);
            var r = t.getViewModel().getProperty("/filterModel/instancesFilter/categories/completedBefore/actual");
            this.getView().byId("completedBeforeDateTimePickerfb").setValue(r)
        },
        onAfterRendering: function () {
            s.onAfterRendering(this, "com.sap.spa.monitorworkflow.view.fragments.InstancesViewFilterDialog_spa");
            this.instancesTable = this.getView().byId("instancesList");
            var e = t.getViewModel();
            if (this._getRouter().getRouteInfoByHash(this._getRouter().getHashChanger().getHash()).name === "workflowInstances") {
                e.setProperty("/filterModel/instancesFilter/filterBar/isVisible", false);
                e.setProperty("/filterModel/instancesFilter/filterMaster/headerExpanded", true)
            } else {
                e.setProperty("/filterModel/instancesFilter/filterMaster/headerExpanded", false)
            }
            t.updateWorkflowDefinitionsFragmentModel(function () {
                t.updateEnvironmentsForInstanceFilter();
                t.updateDefinitionsForInstancesFilter();
                t.updateProjectsForInstancesFilter();
                t.setInstancesFilterOnSelectedDefinitionIdAndEnvironmentId()
            }, i.handleSilentError);
            this.instancesTable.addEventDelegate({
                onAfterRendering: function () {
                    if (this.getSelectedContextPaths().length > 0) {
                        var e = parseInt(this.getSelectedContextPaths()[0].replaceAll("/", ""), 10);
                        if (e >= 0 && this.getItems().length > 0 && t.getViewModel().getProperty("/needSelectionFocus")) {
                            if (this.getItems()[e]) {
                                this.getItems()[e].focus()
                            }
                        }
                    }
                }
            }, this.instancesTable);
            this.getView().byId("startedAfterDateTimePickerfb").setInitialFocusedDateValue(s.getTodaysDateStartTime());
            this.getView().byId("startedBeforeDateTimePickerfb").setInitialFocusedDateValue(s.getTodaysDateEndTime());
            this.getView().byId("completedAfterDateTimePickerfb").setInitialFocusedDateValue(s.getTodaysDateStartTime());
            this.getView().byId("completedBeforeDateTimePickerfb").setInitialFocusedDateValue(s.getTodaysDateEndTime())
        },
        onBeforeRendering: function () {
            s.bindDefaultFilterSelection()
        },
        fetchData: function () {
            var e = this.oFilterBar.getAllFilterItems().reduce(function (e, t) {
                if (t.getName() == "hierarchy") {
                    e.push({
                        groupName: t.getGroupName(),
                        fieldName: t.getName(),
                        fieldData: t.getControl().getSelectedKey()
                    })
                } else if (t.getName() == "instancesId") {
                    e.push({
                        groupName: t.getGroupName(),
                        fieldName: t.getName(),
                        fieldData: t.getControl().getTokens()
                    })
                } else if (t.getName() == "startedBy") {
                    e.push({
                        groupName: t.getGroupName(),
                        fieldName: t.getName(),
                        fieldData: t.getControl().getTokens()
                    })
                } else if (t.getName() == "startedAfter" || t.getName() == "startedBefore" || t.getName() == "completedAfter" || t.getName() == "completedBefore") {
                    e.push({
                        groupName: t.getGroupName(),
                        fieldName: t.getName(),
                        fieldData: t.getControl().getValue()
                    })
                } else {
                    e.push({
                        groupName: t.getGroupName(),
                        fieldName: t.getName(),
                        fieldData: t.getControl().getSelectedKeys()
                    })
                }
                return e
            }, []);
            return e
        },
        applyData: function (e) {
            e.forEach(function (e) {
                if (e.fieldName == "hierarchy") {
                    var t = this.oFilterBar.determineControlByName(e.fieldName, e.groupName);
                    t.setSelectedKey(e.fieldData)
                } else if (e.fieldName == "startedBy") {
                    var t = this.oFilterBar.determineControlByName(e.fieldName, e.groupName);
                    t.setTokens(s.regenerateMultiInputTokens(e.fieldData))
                } else if (e.fieldName == "instancesId") {
                    var t = this.oFilterBar.determineControlByName(e.fieldName, e.groupName);
                    t.setTokens(s.regenerateMultiInputTokensInstancesId(e.fieldData))
                } else if (e.fieldName == "startedAfter" || e.fieldName == "startedBefore" || e.fieldName == "completedAfter" || e.fieldName == "completedBefore") {
                    var t = this.oFilterBar.determineControlByName(e.fieldName, e.groupName);
                    t.setValue(e.fieldData)
                } else {
                    var t = this.oFilterBar.determineControlByName(e.fieldName, e.groupName);
                    t.setSelectedKeys(e.fieldData)
                }
            }, this)
        },
        getFiltersWithValues: function () {
            var e = this.oFilterBar.getFilterGroupItems().reduce(function (e, i) {
                var a = i.getControl();
                var s = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.startedBy.items;
                var r = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.instancesId.items;
                var l = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.startedAfter.utcFormatted;
                var n = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.startedBefore.utcFormatted;
                var o = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.completedAfter.utcFormatted;
                var d = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.completedBefore.utcFormatted;
                if (a && (a.getSelectedKeys && a.getSelectedKeys().length > 0 || a.getSelectedKey && a.getSelectedKey() != undefined)) {
                    if (a.getName() == "instances" && t.getViewModel().getProperty("/filterModel").instancesFilter.categories.instances.selected != "") {
                        e.push(i)
                    } else if (a.getName() == "startedBy") {
                        if (s.length > 0) {
                            e.push(i)
                        }
                    } else if (a.getName() == "instancesId") {
                        if (r.length > 0) {
                            e.push(i)
                        }
                    } else if (a.getName() != "instances") {
                        e.push(i)
                    }
                }
                if (a && a.getName() === "startedAfter" && l) {
                    e.push(i)
                }
                if (a && a.getName() === "startedBefore" && n) {
                    e.push(i)
                }
                if (a && a.getName() === "completedAfter" && o) {
                    e.push(i)
                }
                if (a && a.getName() === "completedBefore" && d) {
                    e.push(i)
                }
                return e
            }, []);
            return e
        },
        onClearFilter: function (e) {
            t.getViewModel().setProperty("/needSelectionFocus", false);
            t.clearFilterSelectionModel();
            sap.ui.getCore().byId("masterInstancesFilterSearchFieldfb").setValue("");
            this._clearMultiInputTokens();
            this.getView().byId("startedAfterDateTimePickerfb").setValue("");
            this.getView().byId("startedBeforeDateTimePickerfb").setValue("");
            this.getView().byId("completedAfterDateTimePickerfb").setValue("");
            this.getView().byId("completedBeforeDateTimePickerfb").setValue("");
            s.triggerUpdateInstancesView(this)
        },
        _clearMultiInputTokens: function (e) {
            this.getView().byId("startedByMultiInputBoxfb").removeAllTokens();
            this.getView().byId("instancesIdMultiInputBoxfb").removeAllTokens()
        },
        onStatusFilterSelectionComplete: function (e) {
            if (s.getFilterSelectionChangedFlag(d.STATUS)) {
                this.FilteredStatus = e.getSource().getSelectedKeys();
                if (!this.isAdaptFilter) {
                    var i = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.status.items;
                    s.updateFilterModelAndTriggerUpdate(this, this.FilteredStatus, i, "key");
                    s.setFilterSelectionChangedFlag(d.STATUS, false);
                    this._updateFilterBar(false)
                }
                this.oFilterBar.fireFilterChange(e)
            }
        },
        onStatusFilterSelectionChange: function (e) {
            s.setFilterSelectionChangedFlag(d.STATUS, true)
        },
        onInstancesFilterSelectionComplete: function (e) {
            this.FilteredHeirarchichalLevel = e.getSource().getSelectedKey();
            if (!this.isAdaptFilter) {
                var i = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.instances.items;
                s.updateFilterModelAndTriggerUpdate(this, this.FilteredHeirarchichalLevel, i, "key");
                this._updateFilterBar(false)
            }
            this.oFilterBar.fireFilterChange(e)
        },
        onProjectsFilterSelectionComplete: function (e) {
            if (s.getFilterSelectionChangedFlag(d.PROJECT)) {
                this.FilteredProjects = e.getSource().getSelectedKeys();
                if (!this.isAdaptFilter) {
                    var i = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.project.items;
                    s.updateFilterModelAndTriggerUpdate(this, this.FilteredProjects, i, "id");
                    s.setFilterSelectionChangedFlag(d.PROJECT, false);
                    this._updateFilterBar(false)
                }
                this.oFilterBar.fireFilterChange(e)
            }
        },
        onProjectFilterSelectionChange: function (e) {
            s.setFilterSelectionChangedFlag(d.PROJECT, true)
        },
        onDefinitionsFilterSelectionComplete: function (e) {
            if (s.getFilterSelectionChangedFlag(d.DEFNITION)) {
                this.FilteredDefinitions = e.getSource().getSelectedKeys();
                if (!this.isAdaptFilter) {
                    var i = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.definitionId.items;
                    s.updateFilterModelAndTriggerUpdate(this, this.FilteredDefinitions, i, "id");
                    s.setFilterSelectionChangedFlag(d.DEFNITION, false);
                    this._updateFilterBar(false)
                }
                this.oFilterBar.fireFilterChange(e)
            }
        },
        onDefinitionFilterSelectionChange: function (e) {
            s.setFilterSelectionChangedFlag(d.DEFNITION, true)
        },
        onEnvironmentFilterSelectionComplete: function (e) {
            if (s.getFilterSelectionChangedFlag(d.ENVIRONMENT)) {
                this.FilteredEnvironments = e.getSource().getSelectedKeys();
                if (!this.isAdaptFilter) {
                    var i = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.environment.items;
                    s.updateFilterModelAndTriggerUpdate(this, this.FilteredEnvironments, i, "id");
                    s.setFilterSelectionChangedFlag(d.ENVIRONMENT, false);
                    this._updateFilterBar(false)
                }
                this.oFilterBar.fireFilterChange(e)
            }
        },
        onEnvironmentFilterSelectionChange: function (e) {
            s.setFilterSelectionChangedFlag(d.ENVIRONMENT, true)
        },
        onExit: function () {
            s.onExit(this, "InstancesMaster");
            sap.ui.getCore().getEventBus().unsubscribe("InstancesDetailsInitCallBack", "ShowInstanceDetails", this._showInstanceDetails, this)
        },
        updateInstances: function (e) {
            t.getViewModel().setProperty("/needSelectionFocus", true);
            s.updateInstances(e, "InstancesMaster");
            this.oFilterBar.fireFilterChange(e)
        },
        updateInstancesForSingleWfInstance: function (e) {
            s.updateInstancesForSingleWfInstance(e, "InstancesMaster")
        },
        onFiltersDialogBeforeOpen: function (e) {
            this.isAdaptFilter = true;
            this.oldFiltered
                = this.FilteredStatus;
            this.oldFilteredHeirarchichalLevel = this.FilteredHeirarchichalLevel;
            this.oldFilteredDefinitions = this.FilteredDefinitions;
            this.oldFilteredEnvironments = this.FilteredEnvironments;
            this.oldFilteredProjects = this.FilteredProjects
        },
        onFilterDialogCancel: function (e) {
            this.FilteredStatus = this.oldFilteredStatus;
            this.FilteredHeirarchichalLevel = this.oldFilteredHeirarchichalLevel;
            this.FilteredDefinitions = this.oldFilteredDefinitions;
            this.FilteredEnvironments = this.oldFilteredEnvironments;
            this.FilteredProjects = this.oldFilteredProjects;
            s.setFilterSelectionChangedFlag(d.STATUS, false);
            s.setFilterSelectionChangedFlag(d.PROJECT, false);
            s.setFilterSelectionChangedFlag(d.DEFNITION, false);
            s.setFilterSelectionChangedFlag(d.ENVIRONMENT, false);
            s.setFilterSelectionChangedFlag(d.INSTANCESID, false)
        },
        onFilterDialogClose: function (e) {
            if (e.getParameters().context == "SEARCH") {
                if (s.getFilterSelectionChangedFlag(d.STATUS)) {
                    var i = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.status.items;
                    s.updateFilterModel(this, this.FilteredStatus, i, "key")
                }
                s.setFilterSelectionChangedFlag(d.STATUS, false);
                if (this.FilteredHeirarchichalLevel != undefined) {
                    var a = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.instances.items;
                    s.updateFilterModel(this, this.FilteredHeirarchichalLevel, a, "key")
                }
                if (s.getFilterSelectionChangedFlag(d.PROJECT)) {
                    var r = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.project.items;
                    s.updateFilterModel(this, this.FilteredProjects, r, "id")
                }
                s.setFilterSelectionChangedFlag(d.PROJECT, false);
                if (s.getFilterSelectionChangedFlag(d.DEFNITION)) {
                    var l = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.definitionId.items;
                    s.updateFilterModel(this, this.FilteredDefinitions, l, "id")
                }
                s.setFilterSelectionChangedFlag(d.DEFNITION, false);
                if (s.getFilterSelectionChangedFlag(d.ENVIRONMENT)) {
                    var n = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.environment.items;
                    s.updateFilterModel(this, this.FilteredEnvironments, n, "id")
                }
                s.setFilterSelectionChangedFlag(d.ENVIRONMENT, false);
                if (s.getFilterSelectionChangedFlag(d.STARTEDBY)) { }
                s.setFilterSelectionChangedFlag(d.STARTEDBY, false);
                var o = this._getStartedAfterValue();
                var c = this._getStartedBeforeValue();
                var g = this._getStartedAfterDateValue();
                var f = this._getStartedBeforeDateValue();
                s.updateStartDateRangeInFilterModel(o, c, g, f);
                var u = this._getCompletedAfterValue();
                var h = this._getCompletedBeforeValue();
                var p = this._getCompletedAfterDateValue();
                var F = this._getCompletedBeforeDateValue();
                s.updateCompleteDateRangeInFilterModel(u, h, p, F);
                if (s.getFilterSelectionChangedFlag(d.INSTANCESID)) { }
                s.setFilterSelectionChangedFlag(d.INSTANCESID, false);
                s.triggerUpdateInstancesView(this);
                this._updateFilterBar(false)
            }
            this.oFilterBar.fireFilterChange(e);
            this.isAdaptFilter = false
        },
        _updateInstancesView: function (e, i, a) {
            if (t.getFilterViewMaster() != null) {
                t.getViewModel().setProperty("/filterModel", t.getFilterViewMaster());
                t.setFilterViewMaster(null)
            }
            var r = t.getViewModel();
            var l = r.getProperty("/filterModel/instancesFilter/filterBar/isVisible");
            s._updateInstancesView(this, e, i, a);
            if (!a) {
                t.getViewModel().setProperty("/filterModel/instancesFilter/filterBar/isVisible", l)
            }
            if (a) {
                var n = a.workflowInstanceId == null;
                this.getView().byId("refreshTable").setVisible(n);
                if (this.instancesTable == undefined) {
                    this.instancesTable = this.getView().byId("instancesList")
                }
                t.getViewModel().setProperty("/isInSPA", window.LuigiClient !== undefined);
                t.getViewModel().setProperty("/isTableView", n);
                this.instancesTable.getColumns()[0].setVisible(!n);
                this.instancesTable.getColumns()[1].setVisible(n);
                this.instancesTable.getColumns()[2].setVisible(n);
                this.instancesTable.getColumns()[3].setVisible(n);
                this.instancesTable.getColumns()[4].setVisible(n);
                this.instancesTable.getColumns()[5].setVisible(n);
                this.instancesTable.getColumns()[6].setVisible(n);
                this.instancesTable.getColumns()[7].setVisible(n);
                if (!n) {
                    s.setSplitViewFilterStyle(this, true);
                    this.instancesTable.addStyleClass("navButtonVisibility");
                    this.instancesTable.addStyleClass("selectedCell");
                    this.instancesTable.addStyleClass("instancesMasterTablePaddingInSplitView");
                    this.instancesTable.removeStyleClass("instancesMasterTablePaddingInTableView");
                    this.instancesTable.removeStyleClass("sapUiSmallMarginTop");
                    this.getView().byId("headerWrapper").addStyleClass("instancesMasterListSectionInSplitView");
                    this.getView().byId("headerWrapper").removeStyleClass("instancesMasterListSectionInTableView");
                    this.getView().byId("filterWrapper").addStyleClass("instancesMasterListSectionInSplitView");
                    this.getView().byId("filterWrapper").removeStyleClass("instancesMasterListSectionInTableView")
                } else {
                    s.setSplitViewFilterStyle(this, false);
                    this.instancesTable.removeStyleClass("navButtonVisibility");
                    this.instancesTable.removeStyleClass("selectedCell");
                    this.instancesTable.removeStyleClass("instancesMasterTablePaddingInSplitView");
                    this.instancesTable.addStyleClass("instancesMasterTablePaddingInTableView");
                    this.instancesTable.addStyleClass("sapUiSmallMarginTop");
                    this.getView().byId("headerWrapper").addStyleClass("instancesMasterListSectionInTableView");
                    this.getView().byId("headerWrapper").removeStyleClass("instancesMasterListSectionInSplitView");
                    this.getView().byId("filterWrapper").addStyleClass("instancesMasterListSectionInTableView");
                    this.getView().byId("filterWrapper").removeStyleClass("instancesMasterListSectionInSplitView")
                }
                l = r.getProperty("/filterModel/instancesFilter/filterBar/isVisible");
                r.setProperty("/filterModel/instancesFilter/filterBar/isVisible", l && !n)
            }
        },
        getEnvironmentName: function (e) {
            return r.getEnvironmentName(e)
        },
        onSelectInstance: function (e) {
            var i = t.getViewModel();
            if (i.getProperty("/isTableView")) {
                i.setProperty("/filterModel/instancesFilter/filterMaster/headerExpanded", false)
            }
            s.onSelectInstance(this, e)
        },
        onSearchInstances: function (e) {
            s.onSearchInstances(this);
            this.oFilterBar.fireFilterChange(e)
        },
        getIconToolTip: function (e) {
            return e && e !== "" ? a.getText("ICON_TOOLTIP_PROCESS") : a.getText("ICON_TOOLTIP_WORKFLOW")
        },
        getProjectVisibility: function (e) {
            return r.getProjectVisibility(e)
        },
        getIconFlag: function (e) {
            return r.getIconFlag(e)
        },
        onMorePress: function () {
            s.onMorePress(this)
        },
        onConfirmViewSettingsDialog: function () {
            s.triggerUpdateInstancesView(this)
        },
        _updateFilterBar: function (e) {
            s._updateFilterBar(e)
        },
        _updateInstancesList: s._updateInstancesList,
        _updateSingleInstance: function () {
            s._updateSingleInstance(this)
        },
        _onInstancesUpdated: function (e) {
            if (!e.getParameter("isSubflow")) {
                s._onInstancesUpdated(this, e)
            }
        },
        handleMonitorLinkPress: function (e) {
            r.handleMonitorLinkPress(this)
        },
        _showInstanceDetails: function (e) {
            if (!e || e !== "InstancesDetailsInitCallBack") {
                this.selectedInstance = e
            }
            s._showInstanceDetails(this, this.selectedInstance, "workflowInstance", "InstancesMaster")
        },
        onRefreshTableView: function () {
            this._updateInstancesList();
            this.getView().byId("instancesList").getBinding("items").refresh()
        },
        onSortStartedOn: function () {
            if (t.getViewModel().getProperty("/isDescending") === false) {
                t.getViewModel().setProperty("/isDescending", true)
            } else {
                t.getViewModel().setProperty("/isDescending", false)
            }
            this.onRefreshTableView();
            this.getView().byId("sortAscendingIcon").setVisible(!t.getViewModel().getProperty("/isDescending"));
            this.getView().byId("sortDescendingIcon").setVisible(t.getViewModel().getProperty("/isDescending"))
        },
        onStartedAfterChange: function (e) {
            var i = this._getStartedAfterValue();
            var r = this._getStartedBeforeValue();
            var l = this._getStartedAfterDateValue();
            var n = this._getStartedBeforeDateValue();
            var o = e.getSource()._bValid;
            var d = o && s.isValidStartTimeDateRange(l, n);
            if (o && d) {
                c = true;
                this._handleStartDateRangeValidationSuccess();
                if (!this.isAdaptFilter) {
                    s.updateStartDateRangeInFilterModel(i, r, l, n);
                    s.triggerUpdateInstancesView(this);
                    this._updateFilterBar(false)
                } else if (g) {
                    this._setAdaptFilterOKButtonEnablement(true)
                }
                this.oFilterBar.fireFilterChange(e)
            } else {
                c = false;
                if (this.isAdaptFilter) {
                    this._setAdaptFilterOKButtonEnablement(false)
                }
                var f = e.getSource();
                f.setValueState(sap.ui.core.ValueState.Error);
                if (!o) {
                    f.setValueStateText(a.getText("INSTANCES_FILTER_INVALID_DATE", (new Date).getFullYear()))
                } else {
                    f.setValueStateText(a.getText("INSTANCES_FILTER_STARTED_AFTER_VALIDATION_FAIL", r));
                    var u = this.getView().byId("startedBeforeDateTimePickerfb");
                    if (u.getValueState() == "Error" && u._bValid) {
                        u.setValueStateText(a.getText("INSTANCES_FILTER_STARTED_BEFORE_VALIDATION_FAIL", i))
                    }
                }
                t.getViewModel().setProperty("/filterModel/instancesFilter/categories/startedAfter/utcFormatted", "")
            }
        },
        onStartedBeforeChange: function (e) {
            var i = this._getStartedAfterValue();
            var r = this._getStartedBeforeValue();
            var l = this._getStartedAfterDateValue();
            var n = this._getStartedBeforeDateValue();
            var o = e.getSource()._bValid;
            var d = o && s.isValidStartTimeDateRange(l, n);
            if (o && d) {
                c = true;
                this._handleStartDateRangeValidationSuccess();
                if (!this.isAdaptFilter) {
                    s.updateStartDateRangeInFilterModel(i, r, l, n);
                    s.triggerUpdateInstancesView(this);
                    this._updateFilterBar(false)
                } else if (g) {
                    this._setAdaptFilterOKButtonEnablement(true)
                }
                this.oFilterBar.fireFilterChange(e)
            } else {
                c = false;
                if (this.isAdaptFilter) {
                    this._setAdaptFilterOKButtonEnablement(false)
                }
                var f = e.getSource();
                f.setValueState(sap.ui.core.ValueState.Error);
                if (!o) {
                    f.setValueStateText(a.getText("INSTANCES_FILTER_INVALID_DATE", (new Date).getFullYear()))
                } else {
                    f.setValueStateText(a.getText("INSTANCES_FILTER_STARTED_BEFORE_VALIDATION_FAIL", i));
                    var u = this.getView().byId("startedAfterDateTimePickerfb");
                    if (u.getValueState() == "Error" && u._bValid) {
                        u.setValueStateText(a.getText("INSTANCES_FILTER_STARTED_AFTER_VALIDATION_FAIL", r))
                    }
                }
                t.getViewModel().setProperty("/filterModel/instancesFilter/categories/startedBefore/utcFormatted", "")
            }
        },
        _getStartedAfterDateValue: function () {
            return this.getView().byId("startedAfterDateTimePickerfb").getDateValue()
        },
        _getStartedBeforeDateValue: function () {
            return this.getView().byId("startedBeforeDateTimePickerfb").getDateValue()
        },
        _getStartedAfterValue: function () {
            return this.getView().byId("startedAfterDateTimePickerfb").getValue()
        },
        _getStartedBeforeValue: function () {
            return this.getView().byId("startedBeforeDateTimePickerfb").getValue()
        },
        _handleStartDateRangeValidationSuccess: function () {
            var e = this.getView().byId("startedAfterDateTimePickerfb");
            if (e._bValid) {
                e.setValueState(sap.ui.core.ValueState.None);
                e.setValueStateText("")
            }
            var t = this.getView().byId("startedBeforeDateTimePickerfb");
            if (t._bValid) {
                t.setValueState(sap.ui.core.ValueState.None);
                t.setValueStateText("")
            }
        },
        _setAdaptFilterOKButtonEnablement: function (e) {
            var t = this.byId("filterbar");
            t && t._oAdaptFiltersDialog && t._oAdaptFiltersDialog.getDependents()[0].getButtons()[0] && t._oAdaptFiltersDialog.getDependents()[0].getButtons()[0].setEnabled(e)
        },
        onCompletedAfterChange: function (e) {
            var i = this._getCompletedAfterValue();
            var r = this._getCompletedBeforeValue();
            var l = this._getCompletedAfterDateValue();
            var n = this._getCompletedBeforeDateValue();
            var o = e.getSource()._bValid;
            var d = o && s.isValidCompleteTimeDateRange(l, n);
            if (o && d) {
                g = true;
                this._handleCompleteDateRangeValidationSuccess();
                if (!this.isAdaptFilter) {
                    s.updateCompleteDateRangeInFilterModel(i, r, l, n);
                    s.triggerUpdateInstancesView(this);
                    this._updateFilterBar(false)
                } else if (c) {
                    this._setAdaptFilterOKButtonEnablement(true)
                }
                this.oFilterBar.fireFilterChange(e)
            } else {
                g = false;
                if (this.isAdaptFilter) {
                    this._setAdaptFilterOKButtonEnablement(false)
                }
                var f = e.getSource();
                f.setValueState(sap.ui.core.ValueState.Error);
                if (!o) {
                    f.setValueStateText(a.getText("INSTANCES_FILTER_INVALID_DATE", (new Date).getFullYear()))
                } else {
                    f.setValueStateText(a.getText("INSTANCES_FILTER_COMPLETED_AFTER_VALIDATION_FAIL", r));
                    var u = this.getView().byId("completedBeforeDateTimePickerfb");
                    if (u.getValueState() == "Error" && u._bValid) {
                        u.setValueStateText(a.getText("INSTANCES_FILTER_COMPLETED_BEFORE_VALIDATION_FAIL", i))
                    }
                }
                t.getViewModel().setProperty("/filterModel/instancesFilter/categories/completedAfter/utcFormatted", "")
            }
        },
        onCompletedBeforeChange: function (e) {
            var i = this._getCompletedAfterValue();
            var r = this._getCompletedBeforeValue();
            var l = this._getCompletedAfterDateValue();
            var n = this._getCompletedBeforeDateValue();
            var o = e.getSource()._bValid;
            var d = o && s.isValidCompleteTimeDateRange(l, n);
            if (o && d) {
                g = true;
                this._handleCompleteDateRangeValidationSuccess();
                if (!this.isAdaptFilter) {
                    s.updateCompleteDateRangeInFilterModel(i, r, l, n);
                    s.triggerUpdateInstancesView(this);
                    this._updateFilterBar(false)
                } else if (c) {
                    this._setAdaptFilterOKButtonEnablement(true)
                }
                this.oFilterBar.fireFilterChange(e)
            } else {
                g = false;
                if (this.isAdaptFilter) {
                    this._setAdaptFilterOKButtonEnablement(false)
                }
                var f = e.getSource();
                f.setValueState(sap.ui.core.ValueState.Error);
                if (!o) {
                    f.setValueStateText(a.getText("INSTANCES_FILTER_INVALID_DATE", (new Date).getFullYear()))
                } else {
                    f.setValueStateText(a.getText("INSTANCES_FILTER_COMPLETED_BEFORE_VALIDATION_FAIL", i));
                    var u = this.getView().byId("completedAfterDateTimePickerfb");
                    if (u.getValueState() == "Error" && u._bValid) {
                        u.setValueStateText(a.getText("INSTANCES_FILTER_COMPLETED_AFTER_VALIDATION_FAIL", r))
                    }
                }
                t.getViewModel().setProperty("/filterModel/instancesFilter/categories/completedBefore/utcFormatted", "")
            }
        },
        _getCompletedAfterDateValue: function () {
            return this.getView().byId("completedAfterDateTimePickerfb").getDateValue()
        },
        _getCompletedBeforeDateValue: function () {
            return this.getView().byId("completedBeforeDateTimePickerfb").getDateValue()
        },
        _getCompletedAfterValue: function () {
            return this.getView().byId("completedAfterDateTimePickerfb").getValue()
        },
        _getCompletedBeforeValue: function () {
            return this.getView().byId("completedBeforeDateTimePickerfb").getValue()
        },
        _handleCompleteDateRangeValidationSuccess: function () {
            var e = this.getView().byId("completedAfterDateTimePickerfb");
            if (e._bValid) {
                e.setValueState(sap.ui.core.ValueState.None);
                e.setValueStateText("")
            }
            var t = this.getView().byId("completedBeforeDateTimePickerfb");
            if (t._bValid) {
                t.setValueState(sap.ui.core.ValueState.None);
                t.setValueStateText("")
            }
        },
        onStartedByTokenFilterUpdate: function (e) {
            var i = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.startedBy.items;
            var a = this.getView().getModel("startedByMultiInputBoxfb");
            var r = e.getParameter("type"),
                l = e.getParameter("addedTokens"),
                n = e.getParameter("removedTokens"),
                c = a.getData()["items"];
            switch (r) {
                case "added":
                    l.forEach(function (e) {
                        c.push({
                            key: e.getKey(),
                            text: e.getText()
                        })
                    });
                    break;
                case "removed":
                    n.forEach(function (e) {
                        c = c.filter(function (t) {
                            return t.key !== e.getKey()
                        })
                    });
                    break;
                default:
                    break
            }
            a.setProperty("/items", c);
            if (r === o.TokenUpdateType.Added) {
                l.forEach(function (e) {
                    if (i.indexOf(e.getText()) < 0) {
                        i.push(e.getText())
                    }
                })
            } else if (r === o.TokenUpdateType.Removed) {
                n.forEach(function (e) {
                    if (i.indexOf(e.getText()) > -1) {
                        i.splice(i.indexOf(e.getText()), 1)
                    }
                })
            }
            if (!this.isAdaptFilter) {
                s.triggerUpdateInstancesView(this);
                this._updateFilterBar(false)
            }
            s.setFilterSelectionChangedFlag(d.STARTEDBY, true);
            this.oFilterBar.fireFilterChange(e);
            this.getView().byId("startedByMultiInputBoxfb").focus()
        },
        onInstancesIdTokenFilterUpdate: function (e) {
            var i = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.instancesId.items;
            var a = this.getView().getModel("instancesIdMultiInputBoxfb");
            var r = e.getParameter("type"),
                l = e.getParameter("addedTokens"),
                n = e.getParameter("removedTokens"),
                c = a.getData()["items"];
            switch (r) {
                case "added":
                    l.forEach(function (e) {
                        c.push({
                            key: e.getKey(),
                            text: e.getText()
                        })
                    });
                    break;
                case "removed":
                    n.forEach(function (e) {
                        c = c.filter(function (t) {
                            return t.key !== e.getKey()
                        })
                    });
                    break;
                default:
                    break
            }
            a.setProperty("/items", c);
            if (r === o.TokenUpdateType.Added) {
                l.forEach(function (e) {
                    if (i.indexOf(e.getText()) < 0) {
                        i.push(e.getText())
                    }
                })
            } else if (r === o.TokenUpdateType.Removed) {
                n.forEach(function (e) {
                    if (i.indexOf(e.getText()) > -1) {
                        i.splice(i.indexOf(e.getText()), 1)
                    }
                })
            }
            if (!this.isAdaptFilter) {
                s.triggerUpdateInstancesView(this);
                this._updateFilterBar(false)
            }
            s.setFilterSelectionChangedFlag(d.INSTANCESID, true);
            this.oFilterBar.fireFilterChange(e);
            this.getView().byId("instancesIdMultiInputBoxfb").focus()
        },
        _initMultiInputModel: function (e) {
            var t = this.getView();
            var i = new l({
                items: []
            });
            t.setModel(i, e);
            var a = t.byId(e);
            var s = function (e) {
                var t = e.text;
                return new n({
                    key: t,
                    text: t
                })
            };
            a.addValidator(s)
        },
        _handleMultiInputForRouteMatch: function () {
            var e = this._getRouter().getRoute("workflowInstances");
            if (!e._aPattern[0].includes("subflowInstances")) {
                e.attachPatternMatched(this._handleEventMultiInputForRouteMatched, this)
            }
        },
        _handleEventMultiInputForRouteMatched: function (e) {
            this.regenerateMultiInputTokensFromSubflow()
        },
        regenerateMultiInputTokensFromSubflow: function () {
            this._clearMultiInputTokens();
            var e = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.startedBy.items;
            var i = this.getView().byId("startedByMultiInputBoxfb");
            e.forEach(function (e) {
                i.addToken(new sap.m.Token({
                    key: e,
                    text: e
                }))
            });
            var a = t.getViewModel().getProperty("/filterModel").instancesFilter.categories.instancesId.items;
            var s = this.getView().byId("instancesIdMultiInputBoxfb");
            a.forEach(function (e) {
                s.addToken(new sap.m.Token({
                    key: e,
                    text: e
                }))
            })
        }
    })
});