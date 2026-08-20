import { useEffect, useLayoutEffect, startTransition, useDeferredValue, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { CatalogPanelInfoRow, DetailReadField } from "../components/catalog/Presentational.jsx";
import { ChevronIcon, Icon } from "../components/icons/Icon.jsx";
import { PageHeader } from "../components/layout/Layout.jsx";
import { DetailPageHeader, DetailPanelDeleteAction, InlineEditActions, InlineSelect, ListPageToolbar, TableActionButton, TableFooterBar, TableToolbar } from "../components/lists/Presentational.jsx";
import { DashboardDetailTabButton, DashboardDoughnutSummaryCard, DashboardFinancialSummaryCard, DashboardIngredientStockAlertCard, DashboardInlineSelect, DashboardInventoryProgressCard, DashboardKpiCard, DashboardKpiSummaryPrimaryCard, DashboardPerformanceCard, DashboardRankedTable, DashboardReportTabButton, DashboardStackedMetricCard, DashboardSubTabButton, DashboardViewModeTabs, MetricCard, MetricFilterCard } from "../components/dashboard/Presentational.jsx";
import { DetailSection, DeviceStatusDot, DeviceStatusIndicator, EmptyDataState, EmptyState, Field, LabButton, LabCheckbox, SelectShell, StatusPill, TablePagination, Toggle } from "../components/ui/Primitives.jsx";
import CatalogModule from "../modules/catalog-management/catalog/CatalogModule.jsx";
import CatalogListPage from "../modules/catalog-management/catalog/pages/CatalogListPage.jsx";
import CategoryListPage from "../modules/catalog-management/category/pages/CategoryListPage.jsx";
import ModifierListPage from "../modules/catalog-management/modifier/pages/ModifierListPage.jsx";
import PricingRuleModule from "../modules/catalog-management/pricing-rule/PricingRuleModule.jsx";
import PricingRuleListPage from "../modules/catalog-management/pricing-rule/pages/PricingRuleListPage.jsx";
import UnitListPage from "../modules/catalog-management/unit/pages/UnitListPage.jsx";
import DashboardModule from "../modules/dashboard/DashboardModule.jsx";
import DashboardOverviewPage from "../modules/dashboard/pages/DashboardOverviewPage.jsx";
import DevicesListPage from "../modules/devices/pages/DevicesListPage.jsx";
import { ASSETS } from "../constants/assets.js";
import { ALL_SELLING_TIME_DAY_LABELS, BUSINESS_UNIT_ASSIGNMENT_GROUPS, SELLING_TIME_DAY_OPTIONS, UNIT_PRECISION_OPTIONS } from "../constants/catalog.js";
import { ALL_BUSINESS_UNITS_LABEL, DASHBOARD_REPORT_TIME_RANGE_OPTIONS, LOCKED_BUSINESS_UNIT_NAMES, SALES_SUMMARY_RANGE_TABS, createInitialDashboardReportTrendOffsets, createInitialSalesSummaryComparisonSelectionState, createInitialSalesSummaryNavigationState, formatDayMonth, formatMonthYear, formatShortMonth, getDaysInMonth, shiftDateByDays, shiftDateByMonths } from "../constants/dashboard.js";
import { SIMULATED_PAIRING_REQUEST_DEVICES } from "../constants/devices.js";
import { DETAIL_PAGE_PARENT, MENU } from "../constants/menu.js";
import { PAGE_CONFIGS } from "../constants/pageConfigs.js";
import { RoleManagementCreatePanel } from "../modules/role-management/panels/RoleManagementCreatePanel.jsx";
import { RoleManagementDetailPanel } from "../modules/role-management/panels/RoleManagementDetailPanel.jsx";
import { DEFAULT_PRICING_OVERRIDE_MAXIMUMS, PRICING_OVERRIDE_GROUPS, PRICING_RULE_MONTH_LABELS } from "../constants/pricing.js";
import { INITIAL_SETTINGS_FORM } from "../constants/settings.js";
import { normalizePricingOverrideMaximumValue, formatPricingOverrideMaximumValue, createPricingOverrideSections, createDefaultPricingOverrideSections, resolvePricingOverrideMaximumForUnitFromSections, syncAssignedUnitsWithPricingSections, clonePricingOverrideSections, createInitialSpecialPricingRuleDraft, parsePricingRuleDisplayValue, getPricingRuleDateDisplayParts, createPricingRuleTimeWindowDisplay, applyPricingRuleMaximums, getSelectedPricingOverrideIdsFromSections, createSpecialPricingRuleRecord, createPricingRuleDetailDraftFromRecord, clonePricingRuleDetailDraftState, getPricingRuleDetailValidationMessage, isSamePricingRuleDetailEditing, normalizeSpecialPricingRuleOverridesForStorage, normalizePricingOverrideEditInput, formatPricingRuleDateDisplay, formatPricingRuleDatePickerValue, findPricingOverrideItem } from "../utils/pricingUtils.js";
import { normalizeUnitPrecisionOption, nextCatalogBuilderId, createEmptyPackageItem, createEmptyIngredientItem, createEmptyAdditionalName, normalizePackageItems, normalizeCatalogIngredients, updatePackageItems, buildAssignedUnitRecord, normalizeCatalogAssignedUnits, createAssignedUnitsFromIds, createSellingTimeSlot, cloneSellingTimeSlots, getSellingTimeSlotErrorKey, getSellingTimeDayErrorPrefix, createSellingTimeDaySchedule, createInitialSellingTimeDraft, createInitialCatalogDraft, getCatalogCategoryForType, getCatalogModifierSummaryValue, getCatalogModifierDetailValue, MODIFIER_INGREDIENT_OPTION_LABELS } from "../utils/catalogDraftUtils.js";
import { createEmptyModifierOption, formatModifierIngredientUnitLabel, getModifierIngredientSelection, normalizeModifierIngredientQtyInput, hasModifierOptionIngredient, isModifierOptionIngredientQtyValid, getModifierOptionNameErrorIds, getModifierOptionDuplicateNameIds, getModifierOptionIngredientQtyErrorIds, getModifierOptionErrors, getModifierSelectionCountError, getModifierSelectionRangeError, clearModifierOptionErrorId, buildModifierOptionDraft, buildModifierOptionRecordForStorage, normalizeModifierOptions, createInitialModifierDraft, createModifierDetailDraftFromRecord, cloneModifierDetailDraftState, createInitialCategoryDraft } from "../utils/modifierUtils.js";
import { createInitialGroupedDeviceDraft, getGroupedDeviceListSummary, findDeviceManagementRecordByValue, getGroupedDeviceDeviceRows, getNormalizedGroupedDeviceTabletRows, getGroupedDeviceCatalogNames, getNormalizedGroupedDeviceCatalogIds, buildGroupedDeviceSelectionOptions, buildGroupedDeviceCatalogSelectionGroups, buildGroupedDeviceDetailRows } from "../utils/deviceGroupUtils.js";
import { getRolePermissionLevel, hasRolePermissionAccess, createRolePermissions, createRolePermissionSections, getRolePermissionGroupIdsForContext, getRolePermissionsStructure, normalizeRoleAccessPermissionSections, createInitialRoleAccessDraft, createRoleAccessDraftFromRecord, getRoleAccessValidationGroups, sortRoleAccessRows, getRoleAccessPermissionSectionErrors, hasAnyVisibleRoleAccessPermission } from "../utils/roleUtils.js";
import { createInitialDeviceManagementDraft, createInitialUnitDraft, createCategoryDetailDraftFromRecord, createUnitDetailDraftFromRecord, cloneCategoryDetailDraftState, cloneUnitDetailDraftState, getCategoryDetailValidationMessage, getUnitDetailValidationMessage, isSameCategoryDetailEditing, isSameUnitDetailEditing, getConnectedCatalogNamesForUnit, getModifierDetailValidationMessage, isSameModifierDetailEditing, getSellingTimeDaysFromRecord, getSellingTimeDayDisplay, getDefaultSellingTimeSlotsForRecord, getSellingTimeDetailSchedule, createSellingTimeDetailDraftFromRecord, cloneSellingTimeDetailDraftState, getSellingTimeDetailValidationMessage, getSellingTimeDetailValidationErrors, isSameSellingTimeDetailEditing, CATEGORY_HIERARCHY_SEPARATOR, MAX_CATEGORY_NESTING_LEVEL, DUPLICATE_CATALOG_SNACKBAR_MESSAGE, DUPLICATE_CATALOG_NAME_ERROR_MESSAGE, DUPLICATE_CATEGORY_ERROR_MESSAGE, DUPLICATE_UNIT_ERROR_MESSAGE, DUPLICATE_MODIFIER_ERROR_MESSAGE, DUPLICATE_PRICING_RULE_ERROR_MESSAGE, DUPLICATE_DEVICE_ERROR_MESSAGE, DUPLICATE_KDS_GROUP_ERROR_MESSAGE, DUPLICATE_ROLE_ACCESS_ERROR_MESSAGE } from "../utils/detailDraftUtils.js";
import { getCategoryHierarchyDepth, getCategorySubtreeDepth, buildOrderedCategoryRows, createCategoryTreeOption, buildCategoryParentOptions, normalizeCatalogIdentityValue, isDuplicateCatalogRecord, buildCatalogCategoryOptions, buildModifierCatalogGroups, getCategoryHierarchyPath, buildCategoryRows, buildModifierRows, buildUnitRows, buildAssignedUnitRows, buildCatalogAssignedUnitRows, normalizeDuplicateNameValue, hasDuplicateRecordName } from "../utils/catalogHierarchyUtils.jsx";
import { getModifierUnitAssignmentColumns, getModifierUnitAssignmentValue, formatModifierDetailOptionPrice, getModifierCatalogSelectSummary, getModifierConnectedCatalogSummary, getModifierDetailUnitAssignmentValue, buildSellingTimeRows, cloneCatalogPhotos, clonePackageItems, cloneCatalogIngredients, cloneAssignedUnits, createCatalogPhotoSet, getCatalogPhotoPoolForRecord, createCatalogPhotoSetForRecord, createCatalogAssignedUnits, createCatalogSeedRecord, createCatalogDetailDraftFromRecord, cloneCatalogDetailDraftState, getCatalogDetailValidationMessage, isSameCatalogDetailEditing, getNextCatalogDetailTypeDraft, getCatalogDetailAssignmentEditingDraft, disposeCatalogPhotos } from "../utils/catalogBuildUtils.js";
import { createInitialDataStore, createInitialSearchState, createInitialFiltersState, createInitialRowsPerPageState, createInitialPageState, createInitialSelectedRowsState} from "../utils/dataStoreUtils.js";
import { cloneDataStore } from "../utils/reportFilterUtils.js";
import { SidebarUnitSwitcher } from "../components/app/SidebarUnitSwitcher.jsx";
import { FilterChip, SingleFilterChip, SingleSelectFilterChip } from "../components/app/FilterChips.jsx";
import { formatDashboardReportDateRangeLabel, formatDashboardReportCompactDate, formatDashboardReportCompactDateRange, formatDashboardReportSelectedDateRangeLabel, getNormalizedDashboardReportRange, buildDashboardCalendarMonth, isDashboardDateWithinRange, DashboardRangeCalendar, DashboardDateRangeField, DashboardReportDateField, generateRandomPairingCode, getSimulatedPairingRequestDevice, isDevicePairingExpired, expirePendingDevice} from "../components/app/DashboardDateWidgets.jsx";
import { DashboardBreakdownSummaryCard, DashboardBarSummaryCard, PendingCountdown, PricingRuleTabButton } from "../components/app/DashboardBreakdownCards.jsx";
import { DashboardLineChartPanel } from "../components/app/DashboardLineChartPanel.jsx";
import { PricingOverrideCard, PricingRuleDateField, SpecialPricingRuleOverrideCard, PricingRuleDetailOverrideTable } from "../components/app/PricingComponents.jsx";
import { FeatureCard, SettingsToggle, CreatePanelStepTabs, CreatePanelFooter } from "../components/app/SettingsComponents.jsx";
import { DetailField, DetailTextAreaField, DetailNumberUnitField, CategoryColorPicker, DetailSelectField, SellingTimeNameField, SellingTimeTimeField } from "../components/app/FormFields.jsx";
import { ModifierCatalogSelectField } from "../components/app/ModifierCatalogSelectField.jsx";
import { ModifierCatalogModalField, ModifierCatalogSelectionModal } from "../components/app/ModifierCatalogModal.jsx";
import { CatalogModifierFieldWithModal } from "../components/app/CatalogModifierModal.jsx";
import { ModifierCreateNameField, ModifierCreateNumberField, ModifierReorderHandle, ModifierOptionPriceField, PackageItemSelectField, ModifierOptionQtyField } from "../components/app/ModifierOptionInputs.jsx";
import { ModifierOptionsTable, CatalogTypeField, getNormalizedNominalDigits, formatNominalInput, PriceField } from "../components/app/ModifierOptionsTable.jsx";
import { UnitAssignmentModal, DiscardChangesModal, PairingCodeModal, DevicePairingRequestModal, DeleteConfirmationModal } from "../components/app/DeviceModals.jsx";
import { DeleteBlockedModal, ModifierOptionDeactivateModal, DeviceStatusConfirmationModal } from "../components/app/ConfirmationModals.jsx";
import { formatIdr, createDashboardReportAnchorDate, formatDashboardReportDate, formatDashboardReportDateValue, createTodayDashboardReportCustomRange, parseDashboardReportDateValue, normalizeDashboardReportDateRange, normalizeDashboardReportDateRangeWithOffset, filterDashboardReportRowsByDate, getDashboardReportDateRangeLengthInDays, getDashboardTrendCopyForTimeRange, getDashboardReportTrendNavigationLimit, getDashboardReportChartDateBounds, getMonthDifference, getStartOfMonth, getEndOfMonth, getStartOfYear, getEndOfYear, getDashboardReportTrendTabsForTimeRange } from "../utils/dashboardDateUtils.js";
import { getDashboardReportTrendWindow, getDashboardReportTrendNavigationLabel, getDashboardReportTrendAnchorDateForOffset } from "../utils/dashboardTrendUtils.js";
import { createDashboardCatalogPerformanceRows } from "../utils/dashboardTrendUtils.js";
import { getDashboardPerformanceTimeRangeMultiplier, getDashboardPerformanceTabsForTimeRange, getDashboardSalesBreakdownSummaryForTimeRange, aggregateDashboardReportRowsByCatalog, getDashboardReportAggregateMeta, aggregateDashboardReportRows, getDashboardReportTrendMeta, getDashboardReportTrendAnchorDate, getDashboardScopedColumns } from "../utils/dashboardPerformanceUtils.js";
import { createDashboardReportTrendBuckets, createDashboardReportTrendPanel, createDashboardSalesReportRows, createDashboardOrderReportRows, createDashboardSalesOrderRows, createLegacyDashboardOrderRows } from "../utils/dashboardTrendBucketUtils.js";
import { buildMetricSeries, normalizeChartSeries, formatSalesSummaryMetricValue, formatSalesSummaryAxisValue, getSalesSummaryMetricMeta, getSalesSummaryMetricLegendItems, getSalesSummaryStats, getSalesSummaryComparisonOptions, getSalesSummaryVisibleDayCount, createSalesSummaryTrendMonthSource, createSalesSummaryComparisonMonthSource, createSalesSummaryShiftSource, createSalesSummaryWeeklyAggregation, createSalesSummaryPanel } from "../utils/salesSummaryUtils.js";
import { createSalesSummaryComparisonPanel } from "../utils/salesSummaryPanelUtils.js";
import { createDashboardDiscountReport, getDiscountReportTimeConfig, createDiscountReportDetail } from "../utils/discountReportUtils.js";
import { createInventoryReportDetail } from "../utils/inventoryReportUtils.jsx";
import { formatSignedIdr, createCashManagementDashboardData, createFinancialReportDashboardData } from "../utils/financialReportUtils.js";
import { createSalesReportDashboard } from "../utils/salesReportDashboardUtils.js";
import { createSalesReportDetailDefinitions } from "../utils/salesReportDetailUtils.js";
import { getDashboardReportSearchFields, getDashboardReportMetricCards, getDashboardReportFilterOptions, normalizeFilterOption, createCountedFilterOptions, createUniqueCountedFilterOptions, getMetricDataForRows } from "../utils/reportFilterUtils.js";

export function useAppHandlers(state) {
  const {
    records,
    currentPage,
    selectedSidebarBusinessUnitId,
    dashboardReportTab,
    dashboardBusinessUnitFilter,
    dashboardReportDetailId,
    dashboardReportDetailView,
    dashboardReportTrendRange,
    dashboardReportTrendOffsets,
    dashboardReportTimeRange,
    dashboardReportCustomRange,
    dashboardReportFilters,
    inventoryReportSort,
    salesReportSort,
    cashManagementSort,
    financialReportSort,
    inventoryDashboardTab,
    inventoryDashboardFilters,
    salesPerformanceTimeRange,
    salesPerformanceCustomRange,
    salesBreakdownTimeRange,
    salesBreakdownCustomRange,
    discountReportRange,
    salesSummaryRange,
    salesSummaryMetric,
    salesSummaryMode,
    salesSummaryComparisonSelection,
    salesSummaryNavigation,
    salesPerformanceTab,
    salesBreakdownTab,
    cashFlowTimeRange,
    cashFlowCustomRange,
    financialReportTimeRange,
    financialReportCustomRange,
    financialExpenseCategoryFilters,
    cashManagementTableTab,
    cashManagementShiftFilters,
    cashFlowTypeFilters,
    cashFlowCreatedByFilters,
    cashDropProcessedByFilters,
    cashAuditVerifiedByFilters,
    pricingRuleTab,
    pricingRuleDetailId,
    pricingRuleDetailPanelTab,
    pricingRuleDetailDraft,
    pricingRuleDetailEditing,
    pricingRuleDetailSnapshot,
    expandedGroups,
    sidebarCollapsed,
    mobileMenuOpen,
    isMobile,
    searchByPage,
    filtersByPage,
    sortByPage,
    sortDirectionByPage,
    rowsPerPage,
    pageByPage,
    selectedRows,
    selectedPricingOverrides,
    pricingOverridesBySection,
    pricingOverrideEditing,
    specialPricingRuleDraft,
    specialPricingRuleDraftErrors,
    snackbar,
    settingsForm,
    catalogDraft,
    catalogDraftErrors,
    categoryDraft,
    categoryDraftErrors,
    unitDraft,
    unitDraftErrors,
    sellingTimeDraft,
    sellingTimeDraftErrors,
    modifierDraft,
    modifierDraftErrors,
    deviceManagementDraft,
    deviceManagementDraftErrors,
    groupedDeviceDraft,
    groupedDeviceDraftErrors,
    groupedDeviceDetailDraftErrors,
    createPanelSteps,
    discardCreateModalOpen,
    discardEditModalOpen,
    deleteConfirmationOpen,
    deleteConfirmationTarget,
    deleteBlockedModal,
    modifierOptionDeactivateConfirm,
    deviceStatusConfirmation,
    pairingCodePopup,
    devicePairingRequest,
    modifierDragOverOptionId,
    isUnitAssignmentModalOpen,
    unitAssignmentSearch,
    assignedUnitAssignmentIds,
    selectedUnitAssignmentIds,
    unitAssignmentTarget,
    modifierCatalogModalTarget,
    modifierCatalogModalValue,
    isModifierCatalogModalOpen,
    isUnroutedCatalogModalOpen,
    categoryDetailId,
    categoryDetailDraft,
    categoryDetailEditing,
    categoryDetailSnapshot,
    categoryDetailErrors,
    unitDetailId,
    unitDetailDraft,
    unitDetailEditing,
    unitDetailSnapshot,
    unitDetailErrors,
    sellingTimeDetailId,
    sellingTimeDetailDraft,
    sellingTimeDetailEditing,
    sellingTimeDetailSnapshot,
    sellingTimeDetailErrors,
    modifierDetailId,
    groupedDeviceDetailId,
    groupedDeviceDetailDraft,
    groupedDeviceDetailEditing,
    roleAccessDetailId,
    roleAccessDetailDraft,
    roleAccessDetailEditing,
    roleAccessDetailSnapshot,
    roleAccessDetailErrors,
    roleAccessDetailPanelTab,
    roleAccessCreatePanelTab,
    roleAccessDraft,
    roleAccessDraftErrors,
    deviceManagementDetailId,
    deviceManagementDetailEditing,
    deviceManagementDetailPanelTab,
    modifierDetailPanelTab,
    modifierDetailDraft,
    modifierDetailEditing,
    modifierDetailSnapshot,
    modifierDetailErrors,
    pricingRuleDetailErrors,
    deviceManagementDetailErrors,
    catalogDetailDraft,
    catalogDetailPanelTab,
    catalogDetailEditing,
    catalogDetailSnapshot,
    catalogDetailDraftErrors,
    setRecords,
    setCurrentPage,
    setSelectedSidebarBusinessUnitId,
    setDashboardReportTab,
    setDashboardBusinessUnitFilter,
    setDashboardReportDetailId,
    setDashboardReportDetailView,
    setDashboardReportTrendRange,
    setDashboardReportTrendOffsets,
    setDashboardReportTimeRange,
    setDashboardReportCustomRange,
    setDashboardReportFilters,
    setInventoryReportSort,
    setSalesReportSort,
    setCashManagementSort,
    setFinancialReportSort,
    setInventoryDashboardTab,
    setInventoryDashboardFilters,
    setSalesPerformanceTimeRange,
    setSalesPerformanceCustomRange,
    setSalesBreakdownTimeRange,
    setSalesBreakdownCustomRange,
    setDiscountReportRange,
    setSalesSummaryRange,
    setSalesSummaryMetric,
    setSalesSummaryMode,
    setSalesSummaryComparisonSelection,
    setSalesSummaryNavigation,
    setSalesPerformanceTab,
    setSalesBreakdownTab,
    setCashFlowTimeRange,
    setCashFlowCustomRange,
    setFinancialReportTimeRange,
    setFinancialReportCustomRange,
    setFinancialExpenseCategoryFilters,
    setCashManagementTableTab,
    setCashManagementShiftFilters,
    setCashFlowTypeFilters,
    setCashFlowCreatedByFilters,
    setCashDropProcessedByFilters,
    setCashAuditVerifiedByFilters,
    setPricingRuleTab,
    setPricingRuleDetailId,
    setPricingRuleDetailPanelTab,
    setPricingRuleDetailDraft,
    setPricingRuleDetailEditing,
    setPricingRuleDetailSnapshot,
    setExpandedGroups,
    setSidebarCollapsed,
    setMobileMenuOpen,
    setIsMobile,
    setSearchByPage,
    setFiltersByPage,
    setSortByPage,
    setSortDirectionByPage,
    setRowsPerPage,
    setPageByPage,
    setSelectedRows,
    setSelectedPricingOverrides,
    setPricingOverridesBySection,
    setPricingOverrideEditing,
    setSpecialPricingRuleDraft,
    setSpecialPricingRuleDraftErrors,
    setSnackbar,
    setSettingsForm,
    setCatalogDraft,
    setCatalogDraftErrors,
    setCategoryDraft,
    setCategoryDraftErrors,
    setUnitDraft,
    setUnitDraftErrors,
    setSellingTimeDraft,
    setSellingTimeDraftErrors,
    setModifierDraft,
    setModifierDraftErrors,
    setDeviceManagementDraft,
    setDeviceManagementDraftErrors,
    setGroupedDeviceDraft,
    setGroupedDeviceDraftErrors,
    setGroupedDeviceDetailDraftErrors,
    setCreatePanelSteps,
    setDiscardCreateModalOpen,
    setDiscardEditModalOpen,
    setDeleteConfirmationOpen,
    setDeleteConfirmationTarget,
    setDeleteBlockedModal,
    setModifierOptionDeactivateConfirm,
    setDeviceStatusConfirmation,
    setPairingCodePopup,
    setDevicePairingRequest,
    setModifierDragOverOptionId,
    setIsUnitAssignmentModalOpen,
    setUnitAssignmentSearch,
    setAssignedUnitAssignmentIds,
    setSelectedUnitAssignmentIds,
    setUnitAssignmentTarget,
    setModifierCatalogModalTarget,
    setModifierCatalogModalValue,
    setIsModifierCatalogModalOpen,
    setIsUnroutedCatalogModalOpen,
    setCategoryDetailId,
    setCategoryDetailDraft,
    setCategoryDetailEditing,
    setCategoryDetailSnapshot,
    setCategoryDetailErrors,
    setUnitDetailId,
    setUnitDetailDraft,
    setUnitDetailEditing,
    setUnitDetailSnapshot,
    setUnitDetailErrors,
    setSellingTimeDetailId,
    setSellingTimeDetailDraft,
    setSellingTimeDetailEditing,
    setSellingTimeDetailSnapshot,
    setSellingTimeDetailErrors,
    setModifierDetailId,
    setGroupedDeviceDetailId,
    setGroupedDeviceDetailDraft,
    setGroupedDeviceDetailEditing,
    setRoleAccessDetailId,
    setRoleAccessDetailDraft,
    setRoleAccessDetailEditing,
    setRoleAccessDetailSnapshot,
    setRoleAccessDetailErrors,
    setRoleAccessDetailPanelTab,
    setRoleAccessCreatePanelTab,
    setRoleAccessDraft,
    setRoleAccessDraftErrors,
    setDeviceManagementDetailId,
    setDeviceManagementDetailEditing,
    setDeviceManagementDetailPanelTab,
    setModifierDetailPanelTab,
    setModifierDetailDraft,
    setModifierDetailEditing,
    setModifierDetailSnapshot,
    setModifierDetailErrors,
    setPricingRuleDetailErrors,
    setDeviceManagementDetailErrors,
    setCatalogDetailDraft,
    setCatalogDetailPanelTab,
    setCatalogDetailEditing,
    setCatalogDetailSnapshot,
    setCatalogDetailDraftErrors,
    discardEditActionRef,
    deviceManagementDetailEditingRef,
    catalogPhotoInputRef,
    catalogPhotoStateRef,
    catalogDetailPhotoInputRef,
    catalogDetailPhotoStateRef,
    deviceManagementDetailDraftRef,
    categoryDetailDraftRef,
    categoryDetailEditingRef,
    categoryDetailSnapshotRef,
    unitDetailDraftRef,
    unitDetailEditingRef,
    unitDetailSnapshotRef,
    pricingRuleDetailDraftRef,
    pricingRuleDetailEditingRef,
    pricingRuleDetailSnapshotRef,
    sellingTimeDetailDraftRef,
    sellingTimeDetailEditingRef,
    sellingTimeDetailSnapshotRef,
    modifierDetailDraftRef,
    modifierDetailEditingRef,
    modifierDetailSnapshotRef,
    catalogDetailDraftRef,
    catalogDetailEditingRef,
    catalogDetailSnapshotRef,
    catalogDetailPackageTableScrollRef,
    catalogDetailAssignmentTableScrollRef,
    pricingOverrideInputRef,
    modifierDraggedOptionIdRef,
    pendingCreateNavigationRef,
    pendingRoleAccessDetailIdRef,
    devicePairingRequestTimerRef,
  } = state;

  const deferredCurrentSearch = useDeferredValue(
    searchByPage[currentPage] ?? ""
  );

  useEffect(() => {
    if (!snackbar) return undefined;
    const timeoutId = window.setTimeout(() => setSnackbar(null), 2800);
    return () => window.clearTimeout(timeoutId);
  }, [snackbar]);

  function clearDevicePairingSimulation(deviceId) {
    const existingTimer = devicePairingRequestTimerRef.current[deviceId];
    if (existingTimer) {
      window.clearTimeout(existingTimer);
      delete devicePairingRequestTimerRef.current[deviceId];
    }
  }

  function scheduleDevicePairingSimulation(device) {
    const existingTimer = devicePairingRequestTimerRef.current[device.id];
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    devicePairingRequestTimerRef.current[device.id] = window.setTimeout(() => {
      const simulatedDevice = getSimulatedPairingRequestDevice(
        device.deviceType,
        device.pairingCode
      );

      delete devicePairingRequestTimerRef.current[device.id];

      setPairingCodePopup((current) =>
        current?.id === device.id ? null : current
      );
      setDevicePairingRequest((current) =>
        current && current.rowId === device.id
          ? current
          : {
            rowId: device.id,
            deviceName: device.deviceName,
            deviceType: device.deviceType,
            pairingCode: device.pairingCode,
            actualDeviceName: simulatedDevice.actualDeviceName,
            actualDeviceType: simulatedDevice.actualDeviceType,
            deviceOs: simulatedDevice.deviceOs,
          }
      );
    }, 15000);
  }

  useEffect(() => {
    return () => {
      Object.values(devicePairingRequestTimerRef.current).forEach((timerId) =>
        window.clearTimeout(timerId)
      );
    };
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      const now = Date.now();
      const expiredRowIds = [];

      setRecords((previous) => {
        const deviceRows = previous["device-management"] ?? [];
        let hasExpiredRows = false;

        const nextDeviceRows = deviceRows.map((row) => {
          if (!isDevicePairingExpired(row, now)) return row;
          hasExpiredRows = true;
          expiredRowIds.push(row.id);
          return expirePendingDevice(row);
        });

        if (!hasExpiredRows) {
          return previous;
        }

        return {
          ...previous,
          "device-management": nextDeviceRows,
        };
      });

      if (!expiredRowIds.length) return;

      expiredRowIds.forEach((rowId) => clearDevicePairingSimulation(rowId));
      setPairingCodePopup((current) =>
        current && expiredRowIds.includes(current.id) ? null : current
      );
      setDevicePairingRequest((current) =>
        current && expiredRowIds.includes(current.rowId) ? null : current
      );
      setDeviceStatusConfirmation((current) =>
        current.rowId && expiredRowIds.includes(current.rowId)
          ? {
            rowId: null,
            deviceName: "",
            nextStatus: "Disconnected",
            disconnectLabel: "Disconnect",
          }
          : current
      );
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const nextIsMobile = window.innerWidth < 768;
      setIsMobile(nextIsMobile);
      if (!nextIsMobile) setMobileMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    catalogPhotoStateRef.current = catalogDraft.photos;
  }, [catalogDraft.photos]);

  useEffect(() => {
    catalogDetailPhotoStateRef.current = catalogDetailDraft?.photos ?? [];
  }, [catalogDetailDraft]);

  useEffect(() => {
    categoryDetailDraftRef.current = categoryDetailDraft;
  }, [categoryDetailDraft]);

  useEffect(() => {
    categoryDetailEditingRef.current = categoryDetailEditing;
  }, [categoryDetailEditing]);

  useEffect(() => {
    deviceManagementDetailDraftRef.current = deviceManagementDraft;
  }, [deviceManagementDraft]);

  useEffect(() => {
    deviceManagementDetailEditingRef.current = deviceManagementDetailEditing;
  }, [deviceManagementDetailEditing]);

  useEffect(() => {
    if (!roleAccessDetailDraft) return;
    // Sync ref if needed for auto-focus or other logic
  }, [roleAccessDetailDraft]);

  useEffect(() => {
    categoryDetailSnapshotRef.current = categoryDetailSnapshot;
  }, [categoryDetailSnapshot]);

  useEffect(() => {
    unitDetailDraftRef.current = unitDetailDraft;
  }, [unitDetailDraft]);

  useEffect(() => {
    unitDetailEditingRef.current = unitDetailEditing;
  }, [unitDetailEditing]);

  useEffect(() => {
    unitDetailSnapshotRef.current = unitDetailSnapshot;
  }, [unitDetailSnapshot]);

  useEffect(() => {
    pricingRuleDetailDraftRef.current = pricingRuleDetailDraft;
  }, [pricingRuleDetailDraft]);

  useEffect(() => {
    pricingRuleDetailEditingRef.current = pricingRuleDetailEditing;
  }, [pricingRuleDetailEditing]);

  useEffect(() => {
    pricingRuleDetailSnapshotRef.current = pricingRuleDetailSnapshot;
  }, [pricingRuleDetailSnapshot]);

  useEffect(() => {
    sellingTimeDetailDraftRef.current = sellingTimeDetailDraft;
  }, [sellingTimeDetailDraft]);

  useEffect(() => {
    sellingTimeDetailEditingRef.current = sellingTimeDetailEditing;
  }, [sellingTimeDetailEditing]);

  useEffect(() => {
    sellingTimeDetailSnapshotRef.current = sellingTimeDetailSnapshot;
  }, [sellingTimeDetailSnapshot]);

  useEffect(() => {
    modifierDetailDraftRef.current = modifierDetailDraft;
  }, [modifierDetailDraft]);

  useEffect(() => {
    modifierDetailEditingRef.current = modifierDetailEditing;
  }, [modifierDetailEditing]);

  useEffect(() => {
    modifierDetailSnapshotRef.current = modifierDetailSnapshot;
  }, [modifierDetailSnapshot]);

  useEffect(() => {
    catalogDetailDraftRef.current = catalogDetailDraft;
  }, [catalogDetailDraft]);

  useEffect(() => {
    catalogDetailEditingRef.current = catalogDetailEditing;
  }, [catalogDetailEditing]);

  useEffect(() => {
    catalogDetailSnapshotRef.current = catalogDetailSnapshot;
  }, [catalogDetailSnapshot]);

  useEffect(() => {
    if (!isUnitAssignmentModalOpen) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsUnitAssignmentModalOpen(false);
        setAssignedUnitAssignmentIds([]);
        setSelectedUnitAssignmentIds([]);
        setUnitAssignmentSearch("");
        setUnitAssignmentTarget("create");
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isUnitAssignmentModalOpen]);

  useEffect(() => {
    if (!discardCreateModalOpen) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        pendingCreateNavigationRef.current = null;
        setDiscardCreateModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [discardCreateModalOpen]);

  useEffect(
    () => () => {
      disposeCatalogPhotos(catalogPhotoStateRef.current);
      disposeCatalogPhotos(catalogDetailPhotoStateRef.current);
    },
    []
  );

  useEffect(() => {
    if (!pricingOverrideEditing) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      const input = pricingOverrideInputRef.current;
      if (!(input instanceof HTMLInputElement)) return;

      input.focus();
      const length = input.value.length;
      input.setSelectionRange?.(length, length);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [pricingOverrideEditing]);

  useEffect(() => {
    if (currentPage === "pricing-rule" && pricingRuleTab === "default") return;
    setPricingOverrideEditing(null);
  }, [currentPage, pricingRuleTab]);

  useEffect(() => {
    if (currentPage === "pricing-rule" && pricingRuleTab === "special") return;
    resetPricingRuleDetailState();
  }, [currentPage, pricingRuleTab]);

  useEffect(() => {
    if (!selectedSidebarBusinessUnitId) return;

    const unitStillExists = (records["business-unit"] || []).some(
      (unit) => unit.id === selectedSidebarBusinessUnitId
    );

    if (!unitStillExists) {
      setSelectedSidebarBusinessUnitId(null);
    }
  }, [records, selectedSidebarBusinessUnitId]);

  useEffect(() => {
    if (!categoryDetailId) return;

    const rowStillExists = (records.category || []).some(
      (row) => row.id === categoryDetailId
    );
    if (!rowStillExists) {
      resetCategoryDetailState();
    }
  }, [records.category, categoryDetailId]);

  useEffect(() => {
    if (!unitDetailId) return;

    const rowStillExists = (records.unit || []).some((row) => row.id === unitDetailId);
    if (!rowStillExists) {
      resetUnitDetailState();
    }
  }, [records.unit, unitDetailId]);

  useEffect(() => {
    if (!modifierDetailId) return;

    const rowStillExists = (records.modifier || []).some(
      (row) => row.id === modifierDetailId
    );
    if (!rowStillExists) {
      resetModifierDetailState();
    }
  }, [records.modifier, modifierDetailId]);

  useEffect(() => {
    if (!sellingTimeDetailId) return;

    const rowStillExists = (records["selling-time"] || []).some(
      (row) => row.id === sellingTimeDetailId
    );
    if (!rowStillExists) {
      resetSellingTimeDetailState();
    }
  }, [records["selling-time"], sellingTimeDetailId]);

  useEffect(() => {
    if (!pricingRuleDetailId) return;

    const rowStillExists = (records["pricing-rule"] || []).some(
      (row) => row.id === pricingRuleDetailId
    );
    if (!rowStillExists) {
      resetPricingRuleDetailState();
    }
  }, [records["pricing-rule"], pricingRuleDetailId]);

  /* The inline edit event listener for Category was removed to enforce explicit Save/Cancel via buttons */

  /* The inline edit event listener for Device Management was removed to enforce explicit Save/Cancel via buttons */

  /* The inline edit event listener for Unit was removed to enforce explicit Save/Cancel via buttons */

  useEffect(() => {
    const detailSurfaceOpen =
      (currentPage === "catalog" || currentPage === "catalog-detail") &&
      Boolean(catalogDetailDraft);
    if (!detailSurfaceOpen || !catalogDetailEditing) return undefined;

    function handleDetailEditKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelCatalogDetailEdit();
      }
    }

    window.addEventListener("keydown", handleDetailEditKeyDown);
    return () => {
      window.removeEventListener("keydown", handleDetailEditKeyDown);
    };
  }, [currentPage, catalogDetailDraft?.id, catalogDetailEditing]);

  useEffect(() => {
    const detailSurfaceOpen =
      (currentPage === "catalog" || currentPage === "catalog-detail") &&
      Boolean(catalogDetailDraft);

    if (!detailSurfaceOpen) return undefined;

    const syncAll = () => {
      syncCatalogDetailPanelTableScroll(
        catalogDetailPackageTableScrollRef.current
      );
      syncCatalogDetailPanelTableScroll(
        catalogDetailAssignmentTableScrollRef.current
      );
    };

    syncAll();
    window.addEventListener("resize", syncAll);
    return () => {
      window.removeEventListener("resize", syncAll);
    };
  }, [currentPage, catalogDetailDraft, catalogDetailPanelTab]);

  useEffect(() => {
    function syncAllTableScrollAreas() {
      document
        .querySelectorAll(".table-card > .table-scroll")
        .forEach((node) => syncTableCardScrollState(node));
    }

    const frameId = window.requestAnimationFrame(() => {
      syncAllTableScrollAreas();
    });

    window.addEventListener("resize", syncAllTableScrollAreas);
    window.addEventListener("scroll", syncAllTableScrollAreas, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", syncAllTableScrollAreas);
      window.removeEventListener("scroll", syncAllTableScrollAreas, true);
    };
  });

  useEffect(() => {
    const detailSurfaceOpen =
      (currentPage === "catalog" || currentPage === "catalog-detail") &&
      Boolean(catalogDetailDraft);
    if (!detailSurfaceOpen || !catalogDetailEditing) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      const editor = document.querySelector(
        "[data-catalog-detail-editor='true']"
      );
      if (!(editor instanceof HTMLElement)) return;

      const focusTarget = editor.querySelector(
        [
          "input:not([type='hidden']):not([type='checkbox']):not([type='radio']):not([disabled])",
          "textarea:not([disabled])",
          "select:not([disabled])",
          "button.catalog-detail-field__trigger:not([disabled])",
          "button.lab-toggle:not([disabled])",
        ].join(",")
      );

      if (!(focusTarget instanceof HTMLElement)) return;

      focusTarget.focus();

      if (
        focusTarget instanceof HTMLInputElement ||
        focusTarget instanceof HTMLTextAreaElement
      ) {
        const length = focusTarget.value.length;
        focusTarget.setSelectionRange?.(length, length);
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [currentPage, catalogDetailDraft?.id, catalogDetailEditing]);

  useEffect(() => {
    const detailSurfaceOpen =
      currentPage === "category" && Boolean(categoryDetailDraft);
    if (!detailSurfaceOpen || !categoryDetailEditing) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      const editor = document.querySelector(
        "[data-category-detail-editor='true']"
      );
      if (!(editor instanceof HTMLElement)) return;

      const focusTarget = editor.querySelector(
        [
          "input:not([type='hidden']):not([type='checkbox']):not([type='radio']):not([disabled])",
          "textarea:not([disabled])",
          "select:not([disabled])",
          "button.catalog-detail-field__trigger:not([disabled])",
        ].join(",")
      );

      if (!(focusTarget instanceof HTMLElement)) return;

      focusTarget.focus();

      if (
        focusTarget instanceof HTMLInputElement ||
        focusTarget instanceof HTMLTextAreaElement
      ) {
        const length = focusTarget.value.length;
        focusTarget.setSelectionRange?.(length, length);
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [currentPage, categoryDetailDraft, categoryDetailEditing]);

  useEffect(() => {
    const detailSurfaceOpen = currentPage === "unit" && Boolean(unitDetailDraft);
    if (!detailSurfaceOpen || !unitDetailEditing) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      const editor = document.querySelector("[data-unit-detail-editor='true']");
      if (!(editor instanceof HTMLElement)) return;

      const focusTarget = editor.querySelector(
        [
          "input:not([type='hidden']):not([type='checkbox']):not([type='radio']):not([disabled])",
          "textarea:not([disabled])",
          "select:not([disabled])",
          "button.catalog-detail-field__trigger:not([disabled])",
        ].join(",")
      );

      if (!(focusTarget instanceof HTMLElement)) return;

      focusTarget.focus();

      if (
        focusTarget instanceof HTMLInputElement ||
        focusTarget instanceof HTMLTextAreaElement
      ) {
        const length = focusTarget.value.length;
        focusTarget.setSelectionRange?.(length, length);
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [currentPage, unitDetailDraft, unitDetailEditing]);

  useEffect(() => {
    const detailSurfaceOpen =
      currentPage === "modifier" && Boolean(modifierDetailDraft);
    if (!detailSurfaceOpen || !modifierDetailEditing) return undefined;

    function handleDetailEditKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelModifierDetailEdit();
      }
    }

    window.addEventListener("keydown", handleDetailEditKeyDown);
    return () => {
      window.removeEventListener("keydown", handleDetailEditKeyDown);
    };
  }, [currentPage, modifierDetailDraft, modifierDetailEditing]);

  useEffect(() => {
    const detailSurfaceOpen =
      currentPage === "modifier" && Boolean(modifierDetailDraft);
    if (!detailSurfaceOpen || !modifierDetailEditing) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      const editor = document.querySelector(
        "[data-modifier-detail-editor='true']"
      );
      if (!(editor instanceof HTMLElement)) return;

      const focusTarget = editor.querySelector(
        [
          "input:not([type='hidden']):not([type='checkbox']):not([type='radio']):not([disabled])",
          "textarea:not([disabled])",
          "select:not([disabled])",
          "button.catalog-detail-field__trigger:not([disabled])",
          "button.lab-toggle:not([disabled])",
        ].join(",")
      );

      if (!(focusTarget instanceof HTMLElement)) return;

      focusTarget.focus();

      if (
        focusTarget instanceof HTMLInputElement ||
        focusTarget instanceof HTMLTextAreaElement
      ) {
        const length = focusTarget.value.length;
        focusTarget.setSelectionRange?.(length, length);
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [currentPage, modifierDetailEditing]);

  useEffect(() => {
    const detailSurfaceOpen =
      currentPage === "pricing-rule" &&
      pricingRuleTab === "special" &&
      Boolean(pricingRuleDetailDraft);
    if (!detailSurfaceOpen || !pricingRuleDetailEditing) return undefined;

    function handleDetailEditKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelPricingRuleDetailEdit();
      }
    }

    window.addEventListener("keydown", handleDetailEditKeyDown);
    return () => {
      window.removeEventListener("keydown", handleDetailEditKeyDown);
    };
  }, [
    currentPage,
    pricingRuleTab,
    pricingRuleDetailDraft,
    pricingRuleDetailEditing,
  ]);

  useEffect(() => {
    const detailSurfaceOpen =
      currentPage === "pricing-rule" &&
      pricingRuleTab === "special" &&
      Boolean(pricingRuleDetailDraft);
    if (!detailSurfaceOpen || !pricingRuleDetailEditing) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      const editor = document.querySelector(
        "[data-pricing-rule-detail-editor='true']"
      );
      if (!(editor instanceof HTMLElement)) return;

      const focusTarget = editor.querySelector(
        [
          "input:not([type='hidden']):not([type='checkbox']):not([type='radio']):not([disabled])",
          "textarea:not([disabled])",
          "select:not([disabled])",
          "button.catalog-detail-field__trigger:not([disabled])",
          "button.lab-toggle:not([disabled])",
        ].join(",")
      );

      if (!(focusTarget instanceof HTMLElement)) return;

      focusTarget.focus();

      if (
        focusTarget instanceof HTMLInputElement ||
        focusTarget instanceof HTMLTextAreaElement
      ) {
        const length = focusTarget.value.length;
        focusTarget.setSelectionRange?.(length, length);
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [
    currentPage,
    pricingRuleTab,
    pricingRuleDetailDraft,
    pricingRuleDetailEditing,
  ]);

  useEffect(() => {
    const detailSurfaceOpen =
      currentPage === "selling-time" && Boolean(sellingTimeDetailDraft);
    if (!detailSurfaceOpen || !sellingTimeDetailEditing) return undefined;

    function handleDetailEditKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelSellingTimeDetailEdit();
        return;
      }

      if (
        event.key !== "Enter" ||
        event.shiftKey ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      const tagName = target?.tagName;
      const isTextInput =
        tagName === "INPUT" &&
        target.type !== "radio" &&
        target.type !== "checkbox";
      const isTimeTrigger =
        target instanceof HTMLButtonElement &&
        target.classList.contains("selling-time-time-field__trigger");

      if (!isTextInput && !isTimeTrigger) return;

      event.preventDefault();
      saveSellingTimeDetailEdit("Selling time updated", {
        showSuccess: false,
      });
    }

    window.addEventListener("keydown", handleDetailEditKeyDown);
    return () => {
      window.removeEventListener("keydown", handleDetailEditKeyDown);
    };
  }, [currentPage, sellingTimeDetailDraft, sellingTimeDetailEditing]);

  useEffect(() => {
    const detailSurfaceOpen =
      currentPage === "selling-time" && Boolean(sellingTimeDetailDraft);
    if (!detailSurfaceOpen || !sellingTimeDetailEditing) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      const editor = document.querySelector(
        "[data-selling-time-detail-editor='true']"
      );
      if (!(editor instanceof HTMLElement)) return;

      const focusTarget = editor.querySelector(
        [
          "input:not([type='hidden']):not([type='checkbox']):not([type='radio']):not([disabled])",
          "textarea:not([disabled])",
          "button.selling-time-time-field__trigger:not([disabled])",
          "button.lab-toggle:not([disabled])",
        ].join(",")
      );

      if (!(focusTarget instanceof HTMLElement)) return;

      focusTarget.focus();

      if (
        focusTarget instanceof HTMLInputElement ||
        focusTarget instanceof HTMLTextAreaElement
      ) {
        const length = focusTarget.value.length;
        focusTarget.setSelectionRange?.(length, length);
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [currentPage, sellingTimeDetailDraft, sellingTimeDetailEditing]);

  function showSnackbar(message, tone = "green") {
    setSnackbar({ message, tone });
  }

  function finalizeCreateSuccess(parentPage, panelId, message) {
    pendingCreateNavigationRef.current = null;
    setDiscardCreateModalOpen(false);
    resetCreatePanelStepValue(panelId);
    handleSetPage(parentPage, { skipCreateGuard: true });
    showSnackbar(message, "green");
  }

  function resetPage(pageId) {
    setPageByPage((previous) => ({ ...previous, [pageId]: 1 }));
  }

  function resetDashboardReportDetailControls() {
    setSearchByPage((previous) => ({
      ...previous,
      "dashboard-report-detail": "",
    }));
    setRowsPerPage((previous) => ({
      ...previous,
      "dashboard-report-detail": 25,
    }));
    setPageByPage((previous) => ({
      ...previous,
      "dashboard-report-detail": 1,
    }));
    setDashboardReportDetailView("by-item");
    setDashboardReportTrendRange("hourly");
    setDashboardReportTrendOffsets(createInitialDashboardReportTrendOffsets());
    setDashboardReportTimeRange("Today");
    setDashboardReportCustomRange({ start: "", end: "" });
    setDiscountReportRange("hourly");
    setDashboardReportFilters({
      category: [],
      discount: [],
      ingredient: [],
      movementType: [],
      updatedBy: [],
      payment: [],
      shift: [],
      orderType: [],
      staff: [],
      status: [],
    });
    setInventoryReportSort({
      key: "currentStockValue",
      direction: "asc",
    });
  }

  function resetDashboardSortState() {
    setInventoryReportSort({
      key: "currentStockValue",
      direction: "asc",
    });
    setSalesReportSort({
      key: "dateTime",
      direction: "desc",
    });
    setCashManagementSort({
      key: "dateTime",
      direction: "desc",
    });
    setFinancialReportSort({
      key: "dateValue",
      direction: "desc",
    });
  }

  function getSearchValue(pageId) {
    return pageId === currentPage
      ? deferredCurrentSearch
      : searchByPage[pageId] ?? "";
  }

  function getNavigationPageId(pageId) {
    if (pageId === "role-access" || pageId === "role-access-create") {
      return "role-management";
    }

    return DETAIL_PAGE_PARENT[pageId] ?? pageId;
  }

  function getGroupForPage(pageId) {
    const navigationPageId = getNavigationPageId(pageId);
    return (
      MENU.find((item) =>
        item.children?.some((child) => child.id === navigationPageId)
      )?.id ?? null
    );
  }

  function getCatalogOptions(key) {
    return createCountedFilterOptions(
      Array.from(new Set((records.catalog || []).map((row) => row[key]).filter(Boolean))),
      records.catalog || [],
      (row) => row[key]
    );
  }

  function getFilterOptions(pageId, filterKey, predefinedOptions = null) {
    const pageRows =
      pageId === "category"
        ? categoryRows
        : pageId === "modifier"
          ? modifierRows
          : pageId === "unit"
            ? unitRows
            : pageId === "selling-time"
              ? sellingTimeRows
              : records[pageId] ?? [];
    const optionSource =
      predefinedOptions ??
      Array.from(new Set(pageRows.map((row) => row[filterKey]).filter(Boolean)));

    return createCountedFilterOptions(
      optionSource,
      pageRows,
      (row) => row[filterKey]
    );
  }

  const categoryRows = buildCategoryRows(records.category || [], records.catalog || []);
  const modifierRows = buildModifierRows(records.modifier || [], modifierDetailDraft, handleModifierListAvailabilityToggle);
  const unitRows = buildUnitRows(records.unit || [], records.catalog || []);
  const sellingTimeRows = buildSellingTimeRows(records["selling-time"] || []);
  const catalogCategoryOptions = buildCatalogCategoryOptions(
    categoryRows,
    records.catalog
  );
  const catalogData = records.catalog || [];
  const catalogCategoryFilterOptions = catalogCategoryOptions.map((option) => ({
    ...option,
    count: catalogData.filter(
      (row) => (row.category || "Uncategorized") === option.value
    ).length,
  }));
  const catalogUnitOptions = (records.unit || []).map((row) => row.name);
  const catalogModifierCountMap = (records.modifier || []).reduce((acc, row) => {
    (row.connectedCatalogItems || []).forEach((name) => {
      acc[name] = (acc[name] || 0) + 1;
    });
    return acc;
  }, {});
  const modifierCatalogGroups = buildModifierCatalogGroups(
    categoryRows,
    (records.catalog || []).filter((row) => row.type !== "package")
  ).map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      atModifierLimit: (catalogModifierCountMap[item.value] || 0) >= 15,
    })),
  }));
  const baseGroupedDeviceCatalogGroups = buildModifierCatalogGroups(
    categoryRows,
    (records.catalog || []).filter((row) => row.type !== "package")
  );
  const groupedDeviceGroups = records["grouped-device"] || [];
  const groupedDeviceCatalogValues = new Set(
    groupedDeviceGroups.flatMap((group) =>
      getNormalizedGroupedDeviceCatalogIds(
        records.catalog || [],
        group.catalogList || []
      )
    )
  );
  const groupedDeviceUnassignedCatalogList = (records.catalog || [])
    .filter((catalog) => !groupedDeviceCatalogValues.has(catalog.id))
    .map((catalog) => catalog.name)
    .sort((a, b) => String(a).localeCompare(String(b)));
  const groupedDeviceUnassignedCatalogCount =
    groupedDeviceUnassignedCatalogList.length;
  const hasGroupedDeviceGroups = groupedDeviceGroups.length > 0;
  const hasKdsDevices = (records["device-management"] || []).some(
    (row) => row.deviceType === "Kitchen Display System (KDS)"
  );
  const catalogModifierOptions = (() => {
    const seen = new Set();
    return (records.modifier || []).reduce((acc, row) => {
      if (!seen.has(row.name)) {
        seen.add(row.name);
        const optionNames = Array.isArray(row.options)
          ? row.options.map((opt) => opt?.name?.trim?.() ?? "").filter(Boolean)
          : [];
        acc.push({ value: row.name, label: row.name, subtitle: optionNames.join(", ") });
      }
      return acc;
    }, []);
  })();
  const catalogSellingTimeOptions = (records["selling-time"] || []).map(
    (row) => row.name
  );
  const catalogRoutingOptions = ["KDS Kitchen", "KDS Bar"];
  const packageCatalogOptions = (records.catalog || [])
    .filter((row) => row.type !== "package")
    .map((row) => row.name);
  const packageCatalogMap = Object.fromEntries(
    (records.catalog || []).map((row) => [row.name, row])
  );
  const selectedSellingTimeDetailRow =
    sellingTimeRows.find((row) => row.id === sellingTimeDetailId) ?? null;
  const selectedPricingRuleDetailRow =
    (records["pricing-rule"] || []).find((row) => row.id === pricingRuleDetailId) ??
    null;
  const selectedCategoryDetailRow =
    categoryRows.find((row) => row.id === categoryDetailId) ?? null;
  const selectedUnitDetailRow =
    unitRows.find((row) => row.id === unitDetailId) ?? null;
  const selectedModifierDetailRow =
    modifierRows.find((row) => row.id === modifierDetailId) ?? null;
  const selectedDeviceManagementDetailRow =
    (records["device-management"] || []).find(
      (row) => row.id === deviceManagementDetailId
    ) ?? null;
  const selectedGroupedDeviceDetailRow =
    groupedDeviceGroups.find((row) => row.id === groupedDeviceDetailId) ?? null;
  const groupedDeviceCreateCatalogGroups =
    buildGroupedDeviceCatalogSelectionGroups(
      baseGroupedDeviceCatalogGroups,
      records.catalog || [],
      groupedDeviceGroups,
      { currentValues: groupedDeviceDraft.catalogList }
    );
  const groupedDeviceDetailCatalogGroups =
    buildGroupedDeviceCatalogSelectionGroups(
      baseGroupedDeviceCatalogGroups,
      records.catalog || [],
      groupedDeviceGroups,
      {
        currentGroupId: groupedDeviceDetailId,
        currentValues:
          groupedDeviceDetailDraft?.catalogList ??
          selectedGroupedDeviceDetailRow?.catalogList ??
          [],
      }
    );

  const selectedRoleAccessDetailRow =
    (records["role-access"] || []).find((row) => row.id === roleAccessDetailId) ??
    null;

  const categoryParentOptions = buildCategoryParentOptions(categoryRows);

  function getDuplicateCatalogNameError(name, excludeId = null) {
    return hasDuplicateRecordName(records.catalog || [], name, { excludeId })
      ? DUPLICATE_CATALOG_NAME_ERROR_MESSAGE
      : null;
  }

  function getDuplicateCategoryNameError(name, excludeId = null) {
    return hasDuplicateRecordName(records.category || [], name, { excludeId })
      ? DUPLICATE_CATEGORY_ERROR_MESSAGE
      : null;
  }

  function getDuplicateUnitNameError(name, excludeId = null) {
    return hasDuplicateRecordName(records.unit || [], name, { excludeId })
      ? DUPLICATE_UNIT_ERROR_MESSAGE
      : null;
  }

  function getDuplicateModifierNameError(name, excludeId = null) {
    return hasDuplicateRecordName(records.modifier || [], name, { excludeId })
      ? DUPLICATE_MODIFIER_ERROR_MESSAGE
      : null;
  }

  function getDuplicatePricingRuleNameError(name, excludeId = null) {
    return hasDuplicateRecordName(records["pricing-rule"] || [], name, {
      excludeId,
    })
      ? DUPLICATE_PRICING_RULE_ERROR_MESSAGE
      : null;
  }

  function getDuplicateDeviceNameError(name, excludeId = null) {
    return hasDuplicateRecordName(records["device-management"] || [], name, {
      excludeId,
      getRowValue: (row) => row?.deviceName,
    })
      ? DUPLICATE_DEVICE_ERROR_MESSAGE
      : null;
  }

  function getDuplicateKdsGroupNameError(name, excludeId = null) {
    return hasDuplicateRecordName(records["grouped-device"] || [], name, {
      excludeId,
    })
      ? DUPLICATE_KDS_GROUP_ERROR_MESSAGE
      : null;
  }

  function getDuplicateRoleAccessNameError(name, excludeId = null) {
    return hasDuplicateRecordName(records["role-access"] || [], name, {
      excludeId,
    })
      ? DUPLICATE_ROLE_ACCESS_ERROR_MESSAGE
      : null;
  }

  function getRoleAccessNameErrors(name, excludeId = null) {
    const nextErrors = {};

    if (!String(name ?? "").trim()) {
      nextErrors.name = true;
    }

    const duplicateNameError = getDuplicateRoleAccessNameError(name, excludeId);
    if (duplicateNameError) {
      nextErrors.name = duplicateNameError;
    }

    return nextErrors;
  }

  function getRoleAccessErrorTab(nextErrors = {}, isEntitySide = false) {
    if (nextErrors.name) {
      return "general";
    }

    const permissionSectionIds = Object.keys(nextErrors.permissionSections ?? {});
    const generalSectionIds = getRolePermissionGroupIdsForContext(
      isEntitySide
    ).filter((groupId) => groupId !== "rms-apps");

    if (
      permissionSectionIds.some((sectionId) =>
        generalSectionIds.includes(sectionId)
      )
    ) {
      return "general";
    }

    if (isEntitySide && permissionSectionIds.some((id) => id === "rms-apps" || id === "payment-app")) {
      return "rms-module";
    }

    return "general";
  }

  function getCategoryDetailContext(categoryRow, detailDraft) {
    if (!categoryRow || !detailDraft) return null;

    const normalizedCategoryName =
      detailDraft.name.trim() || categoryRow.name;
    const normalizedParentCategory =
      detailDraft.parentCategory === "None (Main Category)"
        ? ""
        : detailDraft.parentCategory;
    const effectiveCategoryRecords = (records.category || []).map((item) => {
      if (item.id === detailDraft.id) {
        return {
          ...item,
          name: normalizedCategoryName,
          parentCategory: normalizedParentCategory,
          sellingTime: detailDraft.sellingTime,
        };
      }
      if (item.parentCategory === categoryRow.name) {
        return { ...item, parentCategory: normalizedCategoryName };
      }
      return item;
    });
    const effectiveCatalogRecords = (records.catalog || []).map((catalog) =>
      (catalog.category || "Uncategorized") === categoryRow.name
        ? { ...catalog, category: normalizedCategoryName }
        : catalog
    );
    const effectiveCategoryRows = buildCategoryRows(
      effectiveCategoryRecords,
      effectiveCatalogRecords
    );
    const effectiveCategoryRow =
      effectiveCategoryRows.find((item) => item.id === detailDraft.id) ??
      categoryRow;
    const connectedCatalogNames = effectiveCatalogRecords
      .filter(
        (catalog) =>
          (catalog.category || "Uncategorized") === effectiveCategoryRow.name
      )
      .map((catalog) => catalog.name);
    const currentPath =
      effectiveCategoryRow.hierarchyPath || effectiveCategoryRow.name;
    const maxSubtreeDepth = getCategorySubtreeDepth(
      effectiveCategoryRows,
      currentPath
    );
    const parentOptions = buildCategoryParentOptions(effectiveCategoryRows, {
      excludeId: detailDraft.id,
      blockedPaths: [currentPath],
      maxSubtreeDepth,
    });

    return {
      connectedCatalogNames,
      effectiveCategoryRow,
      parentOptions,
    };
  }

  const selectedSidebarBusinessUnit =
    (records["business-unit"] || []).find(
      (unit) => unit.id === selectedSidebarBusinessUnitId
    ) ?? null;
  const isLockedSelectedBusinessUnit = Boolean(
    selectedSidebarBusinessUnit &&
    LOCKED_BUSINESS_UNIT_NAMES.includes(selectedSidebarBusinessUnit.name)
  );
  const dashboardBusinessUnitOptions = [
    ALL_BUSINESS_UNITS_LABEL,
    ...(records["business-unit"] || []).map((unit) => unit.name),
  ];
  const dashboardReportScopeLabel =
    selectedSidebarBusinessUnit?.name ?? dashboardBusinessUnitFilter;
  const allDashboardBusinessUnitNames = (records["business-unit"] || []).map(
    (unit) => unit.name
  );
  const dashboardReportDetails = createSalesReportDetailDefinitions(
    dashboardReportScopeLabel,
    allDashboardBusinessUnitNames
  );
  const selectedDashboardReportDetail =
    dashboardReportDetails[dashboardReportDetailId] ?? null;
  const dashboardReportTrendTabs = getDashboardReportTrendTabsForTimeRange(
    dashboardReportTimeRange,
    dashboardReportCustomRange,
    createDashboardReportAnchorDate()
  );
  useEffect(() => {
    if (
      dashboardReportTrendTabs.some((tab) => tab.id === dashboardReportTrendRange)
    ) {
      return;
    }

    setDashboardReportTrendRange(dashboardReportTrendTabs[0]?.id ?? "hourly");
  }, [dashboardReportTrendRange, dashboardReportTrendTabs]);
  const dashboardReportSearch =
    searchByPage["dashboard-report-detail"]?.trim().toLowerCase() ?? "";
  const selectedDashboardReportRows = Array.isArray(
    selectedDashboardReportDetail?.rows
  )
    ? selectedDashboardReportDetail.rows
    : [];
  const scopedDashboardReportRows =
    selectedDashboardReportDetail?.id === "sales-orders" &&
      dashboardReportScopeLabel !== ALL_BUSINESS_UNITS_LABEL
      ? selectedDashboardReportRows.filter(
        (row) => row.businessUnit === dashboardReportScopeLabel
      )
      : selectedDashboardReportRows;
  const dashboardReportRowsByRange = selectedDashboardReportDetail
    ? filterDashboardReportRowsByDate(
      scopedDashboardReportRows,
      dashboardReportTimeRange,
      dashboardReportCustomRange,
      createDashboardReportAnchorDate()
    )
    : [];
  const dashboardReportFilterOptions = selectedDashboardReportDetail
    ? getDashboardReportFilterOptions(
      selectedDashboardReportDetail.id,
      dashboardReportRowsByRange
    )
    : {};
  const filteredDashboardReportRows = selectedDashboardReportDetail
    ? dashboardReportRowsByRange.filter((row) => {
      const matchesSearch =
        !dashboardReportSearch ||
        getDashboardReportSearchFields(
          selectedDashboardReportDetail.id,
          dashboardReportDetailView
        ).some((field) =>
          String(row[field] ?? "")
            .toLowerCase()
            .includes(dashboardReportSearch)
        );

      if (!matchesSearch) return false;

      if (
        selectedDashboardReportDetail.id === "sales-orders" &&
        dashboardReportFilters.discount.length
      ) {
        const hasDiscount = (row.discountAppliedValue ?? 0) > 0;
        const matchesDiscount =
          (dashboardReportFilters.discount.includes("With Discount") &&
            hasDiscount) ||
          (dashboardReportFilters.discount.includes("No Discount") &&
            !hasDiscount);

        if (!matchesDiscount) {
          return false;
        }
      }

      if (
        selectedDashboardReportDetail.id === "sales-orders" &&
        dashboardReportFilters.shift.length &&
        !dashboardReportFilters.shift.includes(row.shift)
      ) {
        return false;
      }

      if (
        selectedDashboardReportDetail.id === "sales-orders" &&
        dashboardReportFilters.orderType.length &&
        !dashboardReportFilters.orderType.includes(row.orderType)
      ) {
        return false;
      }

      if (
        selectedDashboardReportDetail.id === "sales-orders" &&
        dashboardReportFilters.staff.length &&
        !dashboardReportFilters.staff.includes(row.staff)
      ) {
        return false;
      }

      if (
        selectedDashboardReportDetail.id === "sales-orders" &&
        dashboardReportDetailView === "by-order" &&
        dashboardReportFilters.payment.length &&
        !dashboardReportFilters.payment.includes(row.payment)
      ) {
        return false;
      }

      if (
        selectedDashboardReportDetail.id === "sales-orders" &&
        dashboardReportDetailView === "by-order" &&
        dashboardReportFilters.status.length &&
        !dashboardReportFilters.status.includes(row.status)
      ) {
        return false;
      }

      return true;
    })
    : [];
  const dashboardReportAggregatedRows = selectedDashboardReportDetail
    ? aggregateDashboardReportRows(
      filteredDashboardReportRows,
      dashboardReportDetailView,
      selectedDashboardReportDetail.id
    )
    : [];
  const activeDashboardReportTrendOffset =
    dashboardReportTrendOffsets[dashboardReportTrendRange] ?? 0;
  const dashboardReportTrendWindow = getDashboardReportTrendWindow(
    dashboardReportTrendRange,
    dashboardReportTimeRange,
    dashboardReportCustomRange,
    scopedDashboardReportRows,
    createDashboardReportAnchorDate(),
    activeDashboardReportTrendOffset
  );
  const dashboardReportTrendRows = selectedDashboardReportDetail
    ? scopedDashboardReportRows.filter((row) => {
      const rowDate = parseDashboardReportDateValue(row.dateValue);
      if (!rowDate) return false;
      return (
        rowDate.getTime() >= dashboardReportTrendWindow.rangeStart.getTime() &&
        rowDate.getTime() <= dashboardReportTrendWindow.rangeEnd.getTime()
      );
    })
    : [];
  const dashboardReportTrendAnchorDate = dashboardReportTrendWindow.anchorDate;
  const dashboardReportTrendNavigationLimit =
    dashboardReportTrendWindow.navigationLimit;
  const dashboardDiscountUsageDetail =
    selectedDashboardReportDetail?.id === "sales-orders" &&
      dashboardReportDetailView === "discount-usage"
      ? createDiscountReportDetail(
        dashboardReportScopeLabel,
        dashboardReportTrendRange,
        dashboardReportTrendAnchorDate
      )
      : null;
  const dashboardDiscountUsageFilterOptions = dashboardDiscountUsageDetail
    ? {
      payment: createUniqueCountedFilterOptions(
        dashboardDiscountUsageDetail.rows,
        (row) => row.payment
      ),
      shift: createUniqueCountedFilterOptions(
        dashboardDiscountUsageDetail.rows,
        (row) => row.shift
      ),
      orderType: createUniqueCountedFilterOptions(
        dashboardDiscountUsageDetail.rows,
        (row) => row.orderType
      ),
      staff: createUniqueCountedFilterOptions(
        dashboardDiscountUsageDetail.rows,
        (row) => row.staff
      ),
    }
    : {};
  const filteredDashboardDiscountUsageRows = dashboardDiscountUsageDetail
    ? dashboardDiscountUsageDetail.rows.filter((row) => {
      const matchesSearch =
        !dashboardReportSearch ||
        row.discountName.toLowerCase().includes(dashboardReportSearch);

      if (!matchesSearch) return false;
      if (
        dashboardReportFilters.shift.length &&
        !dashboardReportFilters.shift.includes(row.shift)
      ) {
        return false;
      }
      if (
        dashboardReportFilters.staff.length &&
        !dashboardReportFilters.staff.includes(row.staff)
      ) {
        return false;
      }
      if (
        dashboardReportFilters.orderType.length &&
        !dashboardReportFilters.orderType.includes(row.orderType)
      ) {
        return false;
      }
      if (
        dashboardReportFilters.payment.length &&
        !dashboardReportFilters.payment.includes(row.payment)
      ) {
        return false;
      }

      return true;
    })
    : [];
  const activeDashboardReportRows =
    selectedDashboardReportDetail?.id === "sales-orders" &&
      dashboardReportDetailView === "by-order"
      ? filteredDashboardReportRows
      : dashboardReportAggregatedRows;
  const dashboardReportMetricCards = selectedDashboardReportDetail
    ? getDashboardReportMetricCards(
      selectedDashboardReportDetail.id,
      filteredDashboardReportRows
    )
    : [];

  function getPricingOverrideMaximumForUnitFromSections(
    sections,
    sectionKey,
    unitId
  ) {
    return resolvePricingOverrideMaximumForUnitFromSections(
      sections,
      sectionKey,
      unitId
    );
  }

  function getPricingOverrideMaximumForUnit(sectionKey, unitId) {
    return getPricingOverrideMaximumForUnitFromSections(
      pricingOverridesBySection,
      sectionKey,
      unitId
    );
  }

  function syncAssignedUnitsWithPricingOverridesFromSections(
    units,
    sectionKey,
    sections
  ) {
    return syncAssignedUnitsWithPricingSections(units, sectionKey, sections);
  }

  function syncAssignedUnitsWithPricingOverrides(units, sectionKey) {
    return syncAssignedUnitsWithPricingOverridesFromSections(
      units,
      sectionKey,
      pricingOverridesBySection
    );
  }

  const syncedCatalogDraftAssignedUnits = syncAssignedUnitsWithPricingOverrides(
    catalogDraft.assignedUnits,
    "catalog"
  );

  function getPackageTotalForItems(items) {
    return items.reduce((sum, item) => {
      const matchedCatalog = packageCatalogMap[item.catalogId];
      const qty = Number(item.qty) || 0;
      return sum + (matchedCatalog ? matchedCatalog.basePrice * qty : 0);
    }, 0);
  }

  const packageTotal = getPackageTotalForItems(catalogDraft.packageItems);
  const catalogDetailPackageTotal = getPackageTotalForItems(
    catalogDetailDraft?.packageItems ?? []
  );

  function getCatalogRows() {
    const { category, availability } = filtersByPage.catalog;
    const search = getSearchValue("catalog").trim().toLowerCase();

    // Expand selected categories to include all descendant categories
    let expandedCategories = null;
    if (category.length) {
      const matchingSet = new Set(category);
      const categoryPathByName = new Map(
        categoryRows.map((row) => [row.name, row.hierarchyPath || row.name])
      );
      categoryRows.forEach((row) => {
        const rowPath = row.hierarchyPath || row.name;
        const isDescendant = category.some((selectedCat) => {
          const selectedPath = categoryPathByName.get(selectedCat) || selectedCat;
          return rowPath.startsWith(`${selectedPath}${CATEGORY_HIERARCHY_SEPARATOR}`);
        });
        if (isDescendant) {
          matchingSet.add(row.name);
        }
      });
      expandedCategories = matchingSet;
    }

    const filteredRows = (records.catalog || []).filter((row) => {
      const matchesSearch =
        !search ||
        [row.name, row.category].some((value) =>
          String(value).toLowerCase().includes(search)
        );
      const rowCategory = row.category || "Uncategorized";
      const matchesCategory =
        !expandedCategories || expandedCategories.has(rowCategory);
      const matchesAvailability =
        availability === "All" ||
        (availability === "Active" && row.availability) ||
        (availability === "Inactive" && !row.availability);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesAvailability
      );
    });

    const sortKey = sortByPage.catalog;
    const sortDirection = sortDirectionByPage.catalog || "asc";
    if (sortKey) {
      filteredRows.sort((a, b) => {
        let aValue, bValue;
        if (sortKey === "price") {
          aValue = parseFloat(a.price) || 0;
          bValue = parseFloat(b.price) || 0;
        } else {
          aValue = String(a[sortKey] ?? "").toLowerCase();
          bValue = String(b[sortKey] ?? "").toLowerCase();
        }
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filteredRows;
  }

  function getRowsForPage(pageId) {
    if (pageId === "catalog") return getCatalogRows();
    if (pageId === "dashboard-report-detail") {
      if (currentPage === "dashboard-discount-report-detail") {
        const discountReportDetail = selectedSidebarBusinessUnit
          ? createDiscountReportDetail(
            selectedSidebarBusinessUnit.name,
            discountReportRange
          )
          : null;
        const normalizedSearch =
          (searchByPage["dashboard-report-detail"] ?? "").trim().toLowerCase();

        return discountReportDetail
          ? discountReportDetail.rows.filter((row) =>
            !normalizedSearch
              ? true
              : row.discountName.toLowerCase().includes(normalizedSearch)
          )
          : [];
      }
      if (
        currentPage === "dashboard-report-detail" &&
        selectedDashboardReportDetail?.id === "sales-orders" &&
        dashboardReportDetailView === "discount-usage"
      ) {
        return filteredDashboardDiscountUsageRows;
      }
      return selectedDashboardReportDetail?.id === "sales-orders"
        ? activeDashboardReportRows
        : selectedDashboardReportDetail?.rows ?? [];
    }

    const config = PAGE_CONFIGS[pageId];
    const search = getSearchValue(pageId).trim().toLowerCase();
    const pageRows =
      pageId === "category"
        ? categoryRows
        : pageId === "modifier"
          ? modifierRows
          : pageId === "unit"
            ? unitRows
            : pageId === "selling-time"
              ? sellingTimeRows
              : pageId === "role-access"
                ? sortRoleAccessRows(records["role-access"] ?? [])
                : pageId === "grouped-device"
                  ? (records["grouped-device"] ?? []).map((row) => {
                    const deviceRowsForGroup = getNormalizedGroupedDeviceTabletRows(
                      records["device-management"] || [],
                      row.deviceList || []
                    );
                    const devices = deviceRowsForGroup
                      .map((device) => device.deviceName)
                      .join(", ");
                    const catalogs = getGroupedDeviceCatalogNames(
                      records["catalog"] || [],
                      row.catalogList || []
                    ).join(", ");
                    return {
                      ...row,
                      deviceListDisplay: devices || "-",
                      deviceListStatusDisplay: deviceRowsForGroup.length
                        ? deviceRowsForGroup.map((device, index) => (
                          <span key={device.id} className="grouped-device-status-item">
                            <span>{device.deviceName}</span>
                            <DeviceStatusDot status={device.status} />
                            {index < deviceRowsForGroup.length - 1 ? (
                              <span>,&nbsp;</span>
                            ) : null}
                          </span>
                        ))
                        : "-",
                      catalogListDisplay: catalogs || "-",
                    };
                  })
                  : records[pageId] ?? [];
    const pageFilters = filtersByPage[pageId] ?? {};

    const filteredRows = pageRows.filter((row) => {
      const matchesSearch =
        !search ||
        config.searchFields.some((field) =>
          String(row[field] ?? "")
            .toLowerCase()
            .includes(search)
        );
      const matchesFilters = (config.filters || []).every((filter) => {
        const activeValue = pageFilters[filter.key];
        if (Array.isArray(activeValue)) {
          return !activeValue.length || activeValue.includes(row[filter.key]);
        }
        return activeValue === "All" || row[filter.key] === activeValue;
      });
      return matchesSearch && matchesFilters;
    });

    const sortKey = sortByPage[pageId];
    const sortDirection = sortDirectionByPage[pageId] || "asc";
    if (sortKey) {
      filteredRows.sort((a, b) => {
        const aValue = String(a[sortKey] ?? "").toLowerCase();
        const bValue = String(b[sortKey] ?? "").toLowerCase();
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    if (pageId === "unit" || pageId === "category") {
      const defaults = filteredRows.filter((r) => r.isDefault);
      const nonDefaults = filteredRows.filter((r) => !r.isDefault);
      return [...nonDefaults, ...defaults];
    }

    return filteredRows;
  }

  function getPagedRows(pageId, rows) {
    const size = rowsPerPage[pageId] || 25;
    const totalPages = Math.max(1, Math.ceil(rows.length / size));
    const page = Math.min(pageByPage[pageId] || 1, totalPages);
    const start = (page - 1) * size;

    return {
      page,
      totalPages,
      rows: rows.slice(start, start + size),
    };
  }

  function handleSetPage(pageId, { skipCreateGuard = false } = {}) {
    if (
      !skipCreateGuard &&
      pageId !== currentPage &&
      guardCreatePanelNavigation(() =>
        handleSetPage(pageId, { skipCreateGuard: true })
      )
    ) {
      return;
    }

    const groupId = getGroupForPage(pageId);
    setExpandedGroups(groupId ? { [groupId]: true } : {});
    if (
      pageId !== "dashboard" &&
      pageId !== "dashboard-report-detail" &&
      pageId !== "dashboard-discount-report-detail"
    ) {
      setDashboardReportDetailId(null);
    }
    if (
      pageId === "pricing-rule" &&
      currentPage !== "pricing-rule" &&
      currentPage !== "pricing-rule-create"
    ) {
      setPricingRuleTab("default");
      setPricingOverrideEditing(null);
      resetPricingRuleDetailState();
    }
    if (pageId !== "category") {
      resetCategoryDetailState();
    }
    if (pageId !== currentPage) {
      const isLeavingRoleManagement =
        currentPage === "role-management" ||
        currentPage === "role-management-create" ||
        currentPage === "role-access" ||
        currentPage === "role-access-create";
      setSearchByPage((prev) => {
        const next = { ...prev, [currentPage]: "" };
        if (isLeavingRoleManagement) next["role-access"] = "";
        return next;
      });
      setFiltersByPage((prev) => {
        const initialFilters = createInitialFiltersState();
        const next = {
          ...prev,
          [currentPage]: initialFilters[currentPage] ?? {},
        };
        if (isLeavingRoleManagement) {
          next["role-access"] = initialFilters["role-access"] ?? {};
        }
        return next;
      });
      setSortByPage({});
      setSortDirectionByPage({});
    }

    if (pageId !== "unit") {
      resetUnitDetailState();
    }
    if (pageId !== "modifier") {
      resetModifierDetailState();
    }
    if (pageId !== "catalog" && pageId !== "catalog-detail") {
      resetCatalogDetailState();
    } else if (pageId !== "catalog-detail") {
      setCatalogDetailEditing(null);
      setCatalogDetailSnapshot(null);
    }
    if (pageId !== "selling-time") {
      resetSellingTimeDetailState();
    }
    if (pageId !== "role-management" && pageId !== "role-access") {
      resetRoleAccessDetailState();
    }
    if (
      pageId === "device-management" &&
      currentPage !== "device-management" &&
      currentPage !== "device-management-create"
    ) {
      setDeviceManagementDetailId(null);
      setDeviceManagementDetailEditing(null);
    }
    if (
      pageId === "grouped-device" &&
      currentPage !== "grouped-device" &&
      currentPage !== "grouped-device-create"
    ) {
      setGroupedDeviceDetailId(null);
      setGroupedDeviceDetailEditing(null);
    }
    if (pageId !== currentPage) {
      setInventoryReportSort({ key: "currentStockValue", direction: "asc" });
      setSalesReportSort({ key: "dateTime", direction: "desc" });
      setCashManagementSort({ key: "dateTime", direction: "desc" });
      setFinancialReportSort({ key: "dateValue", direction: "desc" });

      setSortByPage({});
      setSortDirectionByPage({});
    }

    if (pageId !== "pricing-rule" && pageId !== "pricing-rule-create") {
      resetPricingRuleDetailState();
    }
    if (pageId === "dashboard") {
      setDashboardReportTab("sales-report");
    }
    resetDashboardSortState();
    startTransition(() => setCurrentPage(pageId));
    setMobileMenuOpen(false);
  }

  function handleToggleGroup(
    groupId,
    fallbackPage,
    { skipCreateGuard = false } = {}
  ) {
    const isCurrentGroup = getGroupForPage(currentPage) === groupId;

    if (
      !skipCreateGuard &&
      !isCurrentGroup &&
      guardCreatePanelNavigation(() =>
        handleToggleGroup(groupId, fallbackPage, { skipCreateGuard: true })
      )
    ) {
      return;
    }

    setExpandedGroups((previous) => {
      const isExpanded = Boolean(previous[groupId]);
      if (isCurrentGroup) {
        return isExpanded ? {} : { [groupId]: true };
      }
      return { [groupId]: true };
    });

    if (isCurrentGroup) {
      setMobileMenuOpen(false);
      return;
    }

    setDashboardReportDetailId(null);
    resetCategoryDetailState();
    resetUnitDetailState();
    resetModifierDetailState();
    resetCatalogDetailState();
    resetSellingTimeDetailState();
    resetRoleAccessDetailState();
    resetPricingRuleDetailState();
    if (fallbackPage === "dashboard") {
      setDashboardReportTab("sales-report");
    }
    const isLeavingRoleManagement =
      currentPage === "role-management" ||
      currentPage === "role-management-create" ||
      currentPage === "role-access" ||
      currentPage === "role-access-create";
    if (isLeavingRoleManagement) {
      setSearchByPage((prev) => ({ ...prev, "role-access": "" }));
      setFiltersByPage((prev) => {
        const initialFilters = createInitialFiltersState();
        return { ...prev, "role-access": initialFilters["role-access"] ?? {} };
      });
    }
    resetDashboardSortState();
    startTransition(() => setCurrentPage(fallbackPage));
    setMobileMenuOpen(false);
  }

  function handleSetSearch(pageId, value) {
    setSearchByPage((previous) => ({ ...previous, [pageId]: value }));
    resetPage(pageId);
  }

  useEffect(() => {
    resetDashboardSortState();
  }, [currentPage]);

  function setCreatePanelStepValue(panelId, stepIndex) {
    setCreatePanelSteps((previous) => ({
      ...previous,
      [panelId]: stepIndex,
    }));
  }

  function resetCreatePanelStepValue(panelId) {
    setCreatePanelStepValue(panelId, 0);
  }

  function getActiveCreatePanelConfig(pageId = currentPage) {
    switch (pageId) {
      case "catalog-create":
        return {
          panelId: "catalog",
          pageId,
          parentPage: "catalog",
          label: "Add New Catalog",
        };
      case "category-create":
        return {
          panelId: "category",
          pageId,
          parentPage: "category",
          label: "Add New Category",
        };
      case "unit-create":
        return {
          panelId: "unit",
          pageId,
          parentPage: "unit",
          label: "Add New Unit",
        };
      case "modifier-create":
        return {
          panelId: "modifier",
          pageId,
          parentPage: "modifier",
          label: "Add New Modifier",
        };
      case "pricing-rule-create":
        return {
          panelId: "pricing-rule",
          pageId,
          parentPage: "pricing-rule",
          label: "Add New Special Pricing Rule",
        };
      case "selling-time-create":
        return {
          panelId: "selling-time",
          pageId,
          parentPage: "selling-time",
          label: "Add New Selling Time",
        };
      case "device-management-create":
        return {
          panelId: "device-management",
          pageId,
          parentPage: "device-management",
          label: "Add New Device",
        };
      case "role-management-create":
      case "role-access-create":
        return {
          panelId: "role-management",
          pageId,
          parentPage: "role-management",
          label: "New Role Access",
        };
      default:
        return null;
    }
  }

  function hasCatalogCreateChanges(draft) {
    if (!draft) return false;

    const hasPackageItemChanges = (draft.packageItems ?? []).some(
      (item) => Boolean(item.catalogId) || String(item.qty ?? "1").trim() !== "1"
    );

    return (
      !draft.availability ||
      (draft.photos ?? []).length > 0 ||
      draft.type !== "single" ||
      draft.name.trim() !== "" ||
      (draft.unit || "Pcs") !== "Pcs" ||
      (draft.category || "Uncategorized") !== "Uncategorized" ||
      (draft.modifier ?? []).length > 0 ||
      String(draft.price ?? "").replace(/[^\d]/g, "") !== "0" ||
      Boolean(draft.allowOverridePrice) ||
      hasPackageItemChanges ||
      (draft.assignedUnits ?? []).length > 0
    );
  }

  function hasCategoryCreateChanges(draft) {
    return Boolean(
      draft &&
      (draft.name.trim() !== "" ||
        draft.parentCategory !== "None (Main Category)")
    );
  }

  function hasUnitCreateChanges(draft) {
    return Boolean(
      draft &&
      (draft.name.trim() !== "" ||
        normalizeUnitPrecisionOption(draft.precision) !== "1")
    );
  }

  function hasSellingTimeCreateChanges(draft) {
    if (!draft) return false;

    return (
      draft.name.trim() !== "" ||
      (draft.days ?? []).some(
        (day) =>
          Boolean(day.enabled) ||
          Boolean(day.is24Hours) ||
          (day.slots ?? []).some(
            (slot) => Boolean(slot?.start) || Boolean(slot?.end)
          )
      )
    );
  }

  function hasModifierCreateChanges(draft) {
    if (!draft) return false;

    return (
      draft.name.trim() !== "" ||
      String(draft.minimumSelection ?? "").trim() !== "" ||
      String(draft.maximumSelection ?? "").trim() !== "" ||
      Boolean(draft.allowOverridePrice) ||
      (draft.connectedCatalog ?? []).length > 0 ||
      (draft.assignedUnits ?? []).length > 0 ||
      (draft.options ?? []).length > 1 ||
      (draft.options ?? []).some(
        (option) =>
          option.name.trim() !== "" ||
          getNormalizedNominalDigits(option.additionalPrice) !== "" ||
          Boolean(option.ingredientId || option.selectedIngredient) ||
          normalizeModifierIngredientQtyInput(option.ingredientQty) !== ""
      )
    );
  }

  function hasSpecialPricingRuleCreateChanges(draft) {
    if (!draft) return false;

    const hasOverrideChanges = Object.values(draft.overrides ?? {}).some(
      (groups) =>
        (groups ?? []).some((group) =>
          (group.items ?? []).some(
            (item) => normalizePricingOverrideMaximumValue(item.maximum) !== "0"
          )
        )
    );

    return (
      draft.name.trim() !== "" ||
      draft.startDate.trim() !== "" ||
      draft.endDate.trim() !== "" ||
      (draft.selected?.catalog ?? []).length > 0 ||
      (draft.selected?.modifier ?? []).length > 0 ||
      hasOverrideChanges
    );
  }

  function hasDeviceManagementCreateChanges(draft) {
    return Boolean(
      draft &&
      (draft.deviceName.trim() !== "" ||
        String(draft.deviceType ?? "").trim() !== "" ||
        String(draft.connectedDevices ?? "").trim() !== "")
    );
  }

  function hasRoleAccessCreateChanges(draft) {
    const defaultSectionState = createInitialRoleAccessDraft(
      Boolean(selectedSidebarBusinessUnit)
    ).permissionSections;

    return Boolean(
      draft &&
      (
        draft.name.trim() !== "" ||
        draft.description.trim() !== "" ||
        JSON.stringify(draft.permissionSections ?? {}) !==
        JSON.stringify(defaultSectionState) ||
        Object.values(draft.permissions ?? {}).some(
          (permission) => hasRolePermissionAccess(permission)
        )
      )
    );
  }

  function hasCreatePanelChanges(pageId = currentPage) {
    switch (pageId) {
      case "catalog-create":
        return hasCatalogCreateChanges(catalogDraft);
      case "category-create":
        return hasCategoryCreateChanges(categoryDraft);
      case "unit-create":
        return hasUnitCreateChanges(unitDraft);
      case "modifier-create":
        return hasModifierCreateChanges(modifierDraft);
      case "pricing-rule-create":
        return hasSpecialPricingRuleCreateChanges(specialPricingRuleDraft);
      case "selling-time-create":
        return hasSellingTimeCreateChanges(sellingTimeDraft);
      case "device-management-create":
        return hasDeviceManagementCreateChanges(deviceManagementDraft);
      case "role-management-create":
      case "role-access-create":
        return hasRoleAccessCreateChanges(roleAccessDraft);
      default:
        return false;
    }
  }

  function resetCreatePanelState(pageId = currentPage) {
    closeUnitAssignmentModal();

    switch (pageId) {
      case "catalog-create":
        resetCatalogDraft();
        resetCreatePanelStepValue("catalog");
        break;
      case "category-create":
        resetCategoryDraft();
        resetCreatePanelStepValue("category");
        break;
      case "unit-create":
        resetUnitDraft();
        resetCreatePanelStepValue("unit");
        break;
      case "modifier-create":
        resetModifierDraft();
        resetCreatePanelStepValue("modifier");
        break;
      case "pricing-rule-create":
        resetSpecialPricingRuleDraft();
        resetPricingRuleDetailState();
        setPricingOverrideEditing(null);
        setPricingRuleTab("special");
        resetCreatePanelStepValue("pricing-rule");
        break;
      case "selling-time-create":
        resetSellingTimeDraft();
        resetCreatePanelStepValue("selling-time");
        break;
      case "device-management-create":
        resetDeviceManagementDraft();
        break;
      case "role-management-create":
      case "role-access-create":
        resetRoleAccessDraft();
        break;
      default:
        break;
    }
  }

  function cancelDiscardCreateChanges() {
    pendingCreateNavigationRef.current = null;
    pendingRoleAccessDetailIdRef.current = null;
    setDiscardCreateModalOpen(false);
  }

  function confirmDiscardCreateChanges() {
    const pendingAction = pendingCreateNavigationRef.current;
    pendingCreateNavigationRef.current = null;
    setDiscardCreateModalOpen(false);
    pendingAction?.();
  }

  function cancelDiscardEditChanges() {
    setDiscardEditModalOpen(false);
  }

  function confirmDiscardEditChanges() {
    setDiscardEditModalOpen(false);
    if (discardEditActionRef.current) {
      discardEditActionRef.current();
      discardEditActionRef.current = null;
    }
  }

  function hasDraftChanges(currentDraft, snapshotDraft) {
    return JSON.stringify(currentDraft) !== JSON.stringify(snapshotDraft);
  }

  function guardCreatePanelNavigation(onDiscard) {
    const activeCreatePanel = getActiveCreatePanelConfig();
    if (!activeCreatePanel) return false;

    const proceed = () => {
      resetCreatePanelState(activeCreatePanel.pageId);
      onDiscard?.();
    };

    if (hasCreatePanelChanges(activeCreatePanel.pageId)) {
      pendingCreateNavigationRef.current = proceed;
      setDiscardCreateModalOpen(true);
      return true;
    }

    proceed();
    return true;
  }

  function handleSetDashboardReportTimeRange(value) {
    setDashboardReportTrendOffsets(createInitialDashboardReportTrendOffsets());
    setDashboardReportTimeRange(value);
    setDashboardReportCustomRange(
      value === "Custom Date"
        ? createTodayDashboardReportCustomRange()
        : { start: "", end: "" }
    );
    resetPage("dashboard-report-detail");
  }

  function handleSetDashboardReportFilter(filterKey, value) {
    setDashboardReportFilters((previous) => ({
      ...previous,
      [filterKey]: value,
    }));
    resetPage("dashboard-report-detail");
  }

  function handleSetInventoryDashboardFilter(filterKey, value) {
    setInventoryDashboardFilters((previous) => ({
      ...previous,
      [filterKey]: value,
    }));
    resetPage("dashboard-inventory-report");
  }

  function handleSetInventoryDashboardTab(value) {
    setInventoryDashboardTab(value);
    setInventoryDashboardFilters({
      category: [],
      ingredient: [],
      movementType: [],
      status: [],
      updatedBy: [],
    });
    resetPage("dashboard-inventory-report");
  }

  function handleSetInventoryReportSort(sortKey) {
    setInventoryReportSort((previous) => ({
      key: sortKey,
      direction:
        previous.key === sortKey && previous.direction === "asc"
          ? "desc"
          : "asc",
    }));
    resetPage("dashboard-report-detail");
    resetPage("dashboard-inventory-report");
  }

  function handleSetSalesReportSort(sortKey) {
    setSalesReportSort((previous) => ({
      key: sortKey,
      direction:
        previous.key === sortKey && previous.direction === "asc"
          ? "desc"
          : "asc",
    }));
    resetPage("dashboard-report-detail");
    resetPage("dashboard-discount-report");
  }

  function handleSetCashManagementSort(sortKey) {
    setCashManagementSort((previous) => ({
      key: sortKey,
      direction:
        previous.key === sortKey && previous.direction === "asc"
          ? "desc"
          : "asc",
    }));
    resetPage("dashboard-cash-flow");
    resetPage("dashboard-cash-drop");
    resetPage("dashboard-cash-audit");
  }

  function handleSetFinancialReportSort(sortKey) {
    setFinancialReportSort((previous) => ({
      key: sortKey,
      direction:
        previous.key === sortKey && previous.direction === "asc"
          ? "desc"
          : "asc",
    }));
    resetPage("dashboard-financial-expense");
  }

  function handleSetDashboardReportCustomDate(field, value) {
    setDashboardReportTrendOffsets(createInitialDashboardReportTrendOffsets());
    setDashboardReportCustomRange((previous) => ({
      ...previous,
      [field]: value,
    }));
    resetPage("dashboard-report-detail");
  }

  function handleSetDashboardReportDetailView(value) {
    setDashboardReportDetailView(value);
    setDashboardReportTrendRange("hourly");
    setDashboardReportTrendOffsets(createInitialDashboardReportTrendOffsets());
    resetDashboardSortState();
    resetPage("dashboard-report-detail");
  }

  function handleNavigateDashboardReportTime(direction) {
    setDashboardReportTrendOffsets((previous) => {
      const currentOffset = previous[dashboardReportTrendRange] ?? 0;
      const nextOffset =
        direction === "prev"
          ? Math.min(currentOffset + 1, dashboardReportTrendNavigationLimit)
          : Math.max(0, currentOffset - 1);

      if (nextOffset === currentOffset) {
        return previous;
      }

      return {
        ...previous,
        [dashboardReportTrendRange]: nextOffset,
      };
    });
    resetPage("dashboard-report-detail");
  }

  function getDashboardReportDetailViewForSalesBreakdownTab(tabId) {
    switch (tabId) {
      case "business-unit":
        return "by-business-unit";
      case "category":
        return "by-category";
      case "modifier":
        return "by-modifier";
      case "order-type":
        return "by-order-type";
      case "table":
        return "by-table";
      case "staff":
        return "by-staff";
      case "payment-method":
      case "payment-type":
        return "by-payment-method";
      case "transaction":
        return "by-order";
      case "item-qty":
      case "item-revenue":
      default:
        return "by-item";
    }
  }

  function handleSetSalesPerformanceTimeRange(value) {
    setSalesPerformanceTimeRange(value);
    setSalesPerformanceCustomRange(
      value === "Custom Date"
        ? createTodayDashboardReportCustomRange()
        : { start: "", end: "" }
    );
  }

  function handleSetSalesPerformanceCustomDate(field, value) {
    setSalesPerformanceCustomRange((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSetSalesBreakdownTimeRange(value) {
    setSalesBreakdownTimeRange(value);
    setSalesBreakdownCustomRange(
      value === "Custom Date"
        ? createTodayDashboardReportCustomRange()
        : { start: "", end: "" }
    );
  }

  function handleSetSalesBreakdownCustomDate(field, value) {
    setSalesBreakdownCustomRange((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSetCashFlowTimeRange(value) {
    setCashFlowTimeRange(value);
    setCashFlowCustomRange(
      value === "Custom Date"
        ? createTodayDashboardReportCustomRange()
        : { start: "", end: "" }
    );
  }

  function handleSetCashFlowCustomDate(field, value) {
    setCashFlowCustomRange((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSetFinancialReportTimeRange(value) {
    setFinancialReportTimeRange(value);
    setFinancialReportCustomRange(
      value === "Custom Date"
        ? createTodayDashboardReportCustomRange()
        : { start: "", end: "" }
    );
  }

  function handleSetFinancialReportCustomDate(field, value) {
    setFinancialReportCustomRange((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSetPricingRuleTab(
    value,
    { skipCreateGuard = false } = {}
  ) {
    if (
      !skipCreateGuard &&
      currentPage === "pricing-rule-create" &&
      guardCreatePanelNavigation(() =>
        handleSetPricingRuleTab(value, { skipCreateGuard: true })
      )
    ) {
      return;
    }

    if (currentPage === "pricing-rule-create") {
      handleSetPage("pricing-rule", { skipCreateGuard: true });
    }

    setPricingRuleTab(value);
    setPricingOverrideEditing(null);
    if (value === "default") {
      resetPricingRuleDetailState();
    }
  }

  function handleSetDashboardBusinessUnitFilter(value) {
    setDashboardBusinessUnitFilter(value);

    if (currentPage === "dashboard-report-detail") {
      resetPage("dashboard-report-detail");
    }
  }

  function handleSelectSidebarBusinessUnit(
    unitId,
    { skipCreateGuard = false } = {}
  ) {
    if (
      !skipCreateGuard &&
      guardCreatePanelNavigation(() =>
        handleSelectSidebarBusinessUnit(unitId, { skipCreateGuard: true })
      )
    ) {
      return;
    }

    const normalizedUnitId = unitId === "__main__" ? null : unitId;
    const matchedUnit = (records["business-unit"] || []).find(
      (unit) => unit.id === normalizedUnitId
    );

    setSelectedSidebarBusinessUnitId(normalizedUnitId);
    setDashboardBusinessUnitFilter(
      matchedUnit?.name ?? ALL_BUSINESS_UNITS_LABEL
    );
    setDashboardReportDetailId(null);
    resetDashboardReportDetailControls();
    setDashboardReportTab("sales-report");
    setSalesPerformanceTimeRange("Today");
    setSalesPerformanceCustomRange({ start: "", end: "" });
    setSalesBreakdownTimeRange("Today");
    setSalesBreakdownCustomRange({ start: "", end: "" });
    setSalesSummaryRange("hourly");
    setSalesSummaryMetric("sales");
    setSalesSummaryMode("trend");
    setSalesSummaryComparisonSelection(
      createInitialSalesSummaryComparisonSelectionState()
    );
    setSalesSummaryNavigation(createInitialSalesSummaryNavigationState());
    setSalesPerformanceTab("item-qty");
    setSalesBreakdownTab(normalizedUnitId ? "item-qty" : "business-unit");
    setCashFlowTimeRange("Today");
    setCashFlowCustomRange({ start: "", end: "" });
    setFinancialReportTimeRange("Today");
    setFinancialReportCustomRange({ start: "", end: "" });
    setFinancialExpenseCategoryFilters([]);
    setCashManagementTableTab("cash-flow");
    setCashManagementShiftFilters([]);
    setCashFlowTypeFilters([]);
    setCashFlowCreatedByFilters([]);
    setCashDropProcessedByFilters([]);
    setCashAuditVerifiedByFilters([]);
    handleSetPage("dashboard");
  }

  function handleOpenDashboardReportDetail(reportId) {
    resetDashboardReportDetailControls();
    const byItemReportIds = new Set([]);
    const byTransactionReportIds = new Set([
      "total-sales",
      "total-orders",
      "profit",
      "average-order-value",
      "tax-collected",
      "refund-transaction",
      "void-transaction",
      "cancelled-orders",
    ]);
    const presetStatusFilters = {
      "refund-transaction": { status: ["Refund"] },
      "void-transaction": { status: ["VOID"] },
      "cancelled-orders": { status: ["Cancelled"] },
    };

    if (reportId === "discount-summary") {
      setDashboardReportDetailId("sales-orders");
      setDashboardReportDetailView("discount-usage");
      setDashboardReportFilters({
        category: [],
        discount: [],
        ingredient: [],
        movementType: [],
        updatedBy: [],
        payment: [],
        shift: [],
        orderType: [],
        staff: [],
        status: [],
      });
    } else if (reportId === "inventory-report") {
      setDashboardReportTab("inventory-report");
      setInventoryDashboardTab("stock-level");
      setInventoryDashboardFilters({
        category: [],
        ingredient: [],
        movementType: [],
        updatedBy: [],
        status: [],
      });
      resetPage("dashboard-inventory-report");
      resetDashboardSortState();
      startTransition(() => setCurrentPage("dashboard"));
      return;
    } else if (
      byItemReportIds.has(reportId) ||
      byTransactionReportIds.has(reportId)
    ) {
      const nextDetailView = byItemReportIds.has(reportId)
        ? "by-item"
        : "by-order";
      const presetFilters = presetStatusFilters[reportId] ?? {};
      setDashboardReportDetailId("sales-orders");
      setDashboardReportDetailView(nextDetailView);
      setDashboardReportFilters({
        category: [],
        discount: presetFilters.discount ?? [],
        ingredient: [],
        movementType: [],
        updatedBy: [],
        payment: [],
        shift: [],
        orderType: [],
        staff: [],
        status: presetFilters.status ?? [],
      });
    } else {
      setDashboardReportDetailId(reportId);
    }
    resetPage("dashboard-report-detail");
    resetDashboardSortState();
    startTransition(() => setCurrentPage("dashboard-report-detail"));
  }

  function handleOpenSalesBreakdownDetail(tabId) {
    resetDashboardReportDetailControls();
    setDashboardReportDetailId("sales-orders");
    setDashboardReportDetailView(
      getDashboardReportDetailViewForSalesBreakdownTab(tabId)
    );
    resetPage("dashboard-report-detail");
    resetDashboardSortState();
    startTransition(() => setCurrentPage("dashboard-report-detail"));
  }

  function handleNavigateSalesSummary(direction) {
    setSalesSummaryNavigation((previous) => {
      const currentOffset = previous[salesSummaryRange] ?? 0;
      const nextOffset =
        direction === "prev"
          ? currentOffset + 1
          : Math.max(0, currentOffset - 1);

      if (nextOffset === currentOffset) {
        return previous;
      }

      return {
        ...previous,
        [salesSummaryRange]: nextOffset,
      };
    });
  }

  function handleChangeSalesSummaryComparisonSelection(field, value) {
    setSalesSummaryComparisonSelection((previous) => ({
      ...previous,
      [salesSummaryRange]: {
        ...(previous[salesSummaryRange] ?? { current: 0, compare: 1 }),
        [field]: Number(value),
      },
    }));
  }

  function handleSetFilter(pageId, filterKey, value) {
    setFiltersByPage((previous) => ({
      ...previous,
      [pageId]: { ...previous[pageId], [filterKey]: value },
    }));
    resetPage(pageId);
  }

  function handleSetSort(pageId, sortKey) {
    const currentSort = sortByPage[pageId];
    const currentDirection = sortDirectionByPage[pageId] || "asc";
    const newDirection = currentSort === sortKey && currentDirection === "asc" ? "desc" : "asc";
    setSortByPage((previous) => ({ ...previous, [pageId]: sortKey }));
    setSortDirectionByPage((previous) => ({ ...previous, [pageId]: newDirection }));
    resetPage(pageId);
  }

  function handleSetRowsPerPage(pageId, value) {
    setRowsPerPage((previous) => ({ ...previous, [pageId]: value }));
    resetPage(pageId);
  }

  function handlePaginate(pageId, direction) {
    const filteredRows = getRowsForPage(pageId);
    const totalPages = Math.max(
      1,
      Math.ceil(filteredRows.length / (rowsPerPage[pageId] || 25))
    );

    setPageByPage((previous) => {
      const nextPage =
        direction === "next"
          ? Math.min((previous[pageId] || 1) + 1, totalPages)
          : Math.max((previous[pageId] || 1) - 1, 1);

      return { ...previous, [pageId]: nextPage };
    });
  }

  function handleGoToPage(pageId, value) {
    const filteredRows = getRowsForPage(pageId);
    const totalPages = Math.max(
      1,
      Math.ceil(filteredRows.length / (rowsPerPage[pageId] || 25))
    );

    setPageByPage((previous) => ({
      ...previous,
      [pageId]: Math.min(Math.max(value, 1), totalPages),
    }));
  }

  function handleToggleSelectedRow(pageId, rowId) {
    setSelectedRows((previous) => {
      const next = new Set(previous[pageId]);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }

      return { ...previous, [pageId]: Array.from(next) };
    });
  }

  function handleToggleAllRows(pageId, rows) {
    setSelectedRows((previous) => {
      const visibleIds = rows.map((row) => row.id);
      const hasAll =
        visibleIds.length > 0 &&
        visibleIds.every((id) => previous[pageId].includes(id));
      return { ...previous, [pageId]: hasAll ? [] : visibleIds };
    });
  }

  function handleToggleCatalogAvailability(rowId) {
    const row = (records.catalog || []).find((item) => item.id === rowId);
    const currentAvailability = row?.availability !== false;
    const nextAvailability = !currentAvailability;

    setRecords((previous) => ({
      ...previous,
      catalog: previous.catalog.map((item) =>
        item.id === rowId
          ? { ...item, availability: nextAvailability }
          : item
      ),
    }));

    if (catalogDetailDraftRef.current?.id === rowId) {
      setCatalogDetailDraft((previous) => {
        if (!previous || previous.id !== rowId) return previous;
        const nextDraft = { ...previous, availability: nextAvailability };
        catalogDetailDraftRef.current = nextDraft;
        return nextDraft;
      });
    }

    if (catalogDetailSnapshotRef.current?.id === rowId) {
      const nextSnapshot = {
        ...catalogDetailSnapshotRef.current,
        availability: nextAvailability,
      };
      setCatalogDetailSnapshot(nextSnapshot);
      catalogDetailSnapshotRef.current = nextSnapshot;
    }

    if (row) {
      showSnackbar(
        `${row.name} is now ${nextAvailability ? "active" : "inactive"}`,
        "black"
      );
    }
  }

  function handleModifierListAvailabilityToggle(rowId) {
    const row = (records.modifier || []).find((item) => item.id === rowId);
    const currentAvailability = row?.availability !== false;
    const nextAvailability = !currentAvailability;

    setRecords((previous) => ({
      ...previous,
      modifier: previous.modifier.map((item) =>
        item.id === rowId
          ? {
            ...item,
            availability: nextAvailability,
            options: Array.isArray(item.options)
              ? item.options.map((option) => ({
                ...option,
                isAvailable: nextAvailability,
              }))
              : item.options,
          }
          : item
      ),
    }));

    if (modifierDetailDraftRef.current?.id === rowId) {
      setModifierDetailDraft((previous) => {
        if (!previous || previous.id !== rowId) return previous;
        const nextDraft = {
          ...previous,
          availability: nextAvailability,
          options: Array.isArray(previous.options)
            ? previous.options.map((option) => ({
              ...option,
              isAvailable: nextAvailability,
            }))
            : previous.options,
        };
        modifierDetailDraftRef.current = nextDraft;
        return nextDraft;
      });
    }

    if (modifierDetailSnapshotRef.current?.id === rowId) {
      const nextSnapshot = {
        ...modifierDetailSnapshotRef.current,
        availability: nextAvailability,
        options: Array.isArray(modifierDetailSnapshotRef.current.options)
          ? modifierDetailSnapshotRef.current.options.map((option) => ({
            ...option,
            isAvailable: nextAvailability,
          }))
          : modifierDetailSnapshotRef.current.options,
      };
      setModifierDetailSnapshot(nextSnapshot);
      modifierDetailSnapshotRef.current = nextSnapshot;
    }

    if (row) {
      showSnackbar(
        `${row.name} is now ${nextAvailability ? "active" : "inactive"}`,
        "black"
      );
    }
  }

  function requestDeleteRow(pageId, rowId, itemLabel = "") {
    if (pageId === "category") {
      const categoryRecord = (records.category || []).find((r) => r.id === rowId);
      const connectedCount = (records.catalog || []).filter(
        (c) => (c.category || "Uncategorized") === categoryRecord?.name
      ).length;
      if (connectedCount > 0) {
        const msg = `"${categoryRecord?.name}" has ${connectedCount} connected catalog item${connectedCount > 1 ? "s" : ""}. All catalog items inside this category will be automatically moved to "Uncategorized". This action cannot be undone.`;
        setDeleteConfirmationTarget({ pageId, rowId, itemLabel, message: msg });
        setDeleteConfirmationOpen(true);
        return;
      }
    }
    if (pageId === "unit") {
      const unitRecord = (records.unit || []).find((r) => r.id === rowId);
      const connectedCount = (records.catalog || []).filter(
        (c) => (c.unit || "Pcs") === unitRecord?.name
      ).length;
      if (connectedCount > 0) {
        const msg = `"${unitRecord?.name}" has ${connectedCount} connected catalog item${connectedCount > 1 ? "s" : ""}. All catalog items inside this unit will be automatically moved to "Pcs". This action cannot be undone.`;
        setDeleteConfirmationTarget({ pageId, rowId, itemLabel, message: msg });
        setDeleteConfirmationOpen(true);
        return;
      }
    }
    if (pageId === "modifier") {
      const modifierRecord = (records.modifier || []).find((r) => r.id === rowId);
      const connectedItems = Array.isArray(modifierRecord?.connectedCatalogItems)
        ? modifierRecord.connectedCatalogItems.filter(Boolean)
        : [];
      if (connectedItems.length > 0) {
        setDeleteBlockedModal({
          open: true,
          title: `${modifierRecord?.name} is In Use`,
          message: `"${modifierRecord?.name}" is connected to ${connectedItems.length} catalog item${connectedItems.length > 1 ? "s" : ""}. Remove all catalog links before deleting this modifier.`,
        });
        return;
      }
    }
    if (pageId === "catalog") {
      const catalogRecord = (records.catalog || []).find((r) => r.id === rowId);
      const assignedPackages = (records.catalog || []).filter(
        (c) =>
          c.type === "package" &&
          (c.packageItems || []).some(
            (item) => item.catalogId === catalogRecord?.name
          )
      );
      const solePackages = assignedPackages.filter(
        (p) => (p.packageItems || []).filter((item) => item.catalogId).length === 1
      );
      const assignedKdsGroups = (records["grouped-device"] || []).filter((group) => {
        const assignedCatalogIds = getNormalizedGroupedDeviceCatalogIds(
          records.catalog || [],
          group.catalogList || []
        );
        return assignedCatalogIds.includes(catalogRecord?.id);
      });
      const emptyKdsGroups = assignedKdsGroups.filter((group) => {
        const assignedCatalogIds = getNormalizedGroupedDeviceCatalogIds(
          records.catalog || [],
          group.catalogList || []
        );
        return assignedCatalogIds.filter((catalogId) => catalogId !== catalogRecord?.id).length === 0;
      });

      if (solePackages.length > 0) {
        const solePackageNames = solePackages.map((p) => `"${p.name}"`).join(", ");
        setDeleteBlockedModal({
          open: true,
          title: `Cannot Delete Catalog "${catalogRecord?.name}"`,
          message: `"${catalogRecord?.name}" is the only catalog item in the package ${solePackageNames}. A package must have at least one catalog item, so this catalog item cannot be deleted while it's the sole item in that package.`,
        });
        return;
      }
      if (emptyKdsGroups.length > 0) {
        const emptyGroupNames = emptyKdsGroups.map((group) => `"${group.name}"`).join(", ");
        setDeleteBlockedModal({
          open: true,
          title: `Cannot Delete Catalog "${catalogRecord?.name}"`,
          message: `"${catalogRecord?.name}" is the only catalog assigned to the KDS group ${emptyGroupNames}. A KDS group must have at least one catalog, so this catalog item cannot be deleted while it's the sole assigned catalog for that KDS group.`,
        });
        return;
      }
      if (assignedPackages.length > 0) {
        const packageNames = assignedPackages.map((p) => `"${p.name}"`).join(", ");
        const isMultiple = assignedPackages.length > 1;
        const title = `Delete Catalog "${catalogRecord?.name}" Included in ${isMultiple ? "Packages" : "a Package"}?`;
        const msg = `"${catalogRecord?.name}" is currently included in the ${isMultiple ? "packages" : "package"} ${packageNames}. Deleting this catalog item will automatically remove it from the ${isMultiple ? "packages" : "package"}. This action cannot be undone.`;
        setDeleteConfirmationTarget({ pageId, rowId, itemLabel, title, message: msg });
        setDeleteConfirmationOpen(true);
        return;
      }
    }
    setDeleteConfirmationTarget({ pageId, rowId, itemLabel, message: null });
    setDeleteConfirmationOpen(true);
  }

  function requestDeviceStatusChange(row, nextStatus, options = {}) {
    setDeviceStatusConfirmation({
      rowId: row.id,
      deviceName: row.deviceName,
      nextStatus,
      disconnectLabel: options.disconnectLabel ?? "Disconnect",
    });
  }

  function cancelDeleteRequest() {
    setDeleteConfirmationOpen(false);
    setDeleteConfirmationTarget({ pageId: null, rowId: null, itemLabel: "", message: null });
  }

  function cancelDeviceStatusChange() {
    setDeviceStatusConfirmation({
      rowId: null,
      deviceName: "",
      nextStatus: "Disconnected",
      disconnectLabel: "Disconnect",
    });
  }

  function confirmDeleteRow() {
    setDeleteConfirmationOpen(false);
    if (deleteConfirmationTarget.pageId && deleteConfirmationTarget.rowId) {
      handleDeleteRow(deleteConfirmationTarget.pageId, deleteConfirmationTarget.rowId, deleteConfirmationTarget.itemLabel);
    }
    setDeleteConfirmationTarget({ pageId: null, rowId: null, itemLabel: "", message: null });
  }

  function createDeviceManagementTimestamp(date = new Date()) {
    return `${date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, " ")}, ${date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
  }

  function getDeviceConnectedDisplayValue(row) {
    if (!row || row.status !== "Connected") {
      return "-";
    }

    if (Array.isArray(row.connectedDevices) && row.connectedDevices.length) {
      const isPrinter = row.deviceType === "Printer";

      if (isPrinter) {
        // For a printer, its "own hardware" name is found by looking at the devices connected to it.
        // Each connected device's row.deviceConnected stores the printer hardware name.
        const results = row.connectedDevices
          .map((connectedDeviceName) => {
            const connectedRow = (records["device-management"] || []).find(
              (item) => item.deviceName === connectedDeviceName
            );
            return connectedRow?.deviceConnected;
          })
          .filter(Boolean);
        return Array.from(new Set(results)).join(", ");
      } else {
        // For a tablet, its "own hardware" name is found by looking at the printer it's connected to.
        // The printer's row.deviceConnected stores a list of tablet hardware names.
        // We find the tablet's index in the printer's connectedDevices list to pick the correct hardware name.
        const connectedPrinterName = row.connectedDevices[0];
        const connectedPrinter = (records["device-management"] || []).find(
          (item) => item.deviceName === connectedPrinterName
        );
        if (connectedPrinter && connectedPrinter.deviceConnected) {
          const tabletIndex = (connectedPrinter.connectedDevices || []).indexOf(row.deviceName);
          const hardwareNames = connectedPrinter.deviceConnected.split(",").map(s => s.trim());
          if (tabletIndex !== -1 && hardwareNames[tabletIndex]) {
            return hardwareNames[tabletIndex];
          }
          return hardwareNames[0];
        }
        return connectedPrinterName || "-";
      }
    }

    if (
      row.deviceConnected &&
      row.deviceConnected !== "No" &&
      row.deviceConnected !== "Yes"
    ) {
      return row.deviceConnected;
    }

    return row.status === "Connected" ? row.deviceName : "-";
  }

  function getPrinterConnectionDisplay(printerRow) {
    if (printerRow?.connectionType === "Bluetooth") {
      return { label: "Bluetooth ID", value: printerRow.bluetoothId ?? "-" };
    }
    return { label: "IP Address", value: printerRow?.ipAddress ?? "-" };
  }

  function applyDeviceStatusChange(rowId, nextStatus, updates = {}) {
    setRecords((previous) => ({
      ...previous,
      "device-management": (previous["device-management"] || []).map((row) =>
        row.id === rowId
          ? {
            ...row,
            status: nextStatus,
            lastActive:
              nextStatus === "Connected"
                ? createDeviceManagementTimestamp()
                : row.lastActive,
            pairingExpiresAt:
              nextStatus === "Connected" || nextStatus === "Disconnected"
                ? undefined
                : row.pairingExpiresAt,
            ...(nextStatus === "Disconnected"
              ? {
                deviceConnected: null,
                connectedDevices: [],
                deviceOs: null,
                isReconnectFromDisconnect: false,
              }
              : nextStatus === "Connected"
                ? {
                  isReconnectFromDisconnect: false,
                }
                : {}),
            ...updates,
          }
          : row
      ),
    }));
    showSnackbar(
      nextStatus === "Connected" ? "Device connected" : "Device disconnected",
      "green"
    );
  }

  function handleDisconnectToDisconnected(rowId) {
    const currentRow = records["device-management"].find((item) => item.id === rowId);
    clearDevicePairingSimulation(rowId);
    applyDeviceStatusChange(
      rowId,
      "Disconnected",
      currentRow?.status === "Pending" ? { pairingCode: "-" } : {}
    );

    if (pairingCodePopup?.id === rowId) {
      setPairingCodePopup(null);
    }
    if (devicePairingRequest?.rowId === rowId) {
      setDevicePairingRequest(null);
    }

    cancelDeviceStatusChange();
  }

  function handleStartDevicePendingPairing(row, isReconnectFromDisconnect = false) {
    const code = generateRandomPairingCode();
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const pendingDevice = {
      ...row,
      status: "Pending",
      deviceConnected: null,
      deviceOs: null,
      pairingCode: code,
      pairingExpiresAt: expiresAt,
      isReconnectFromDisconnect,
    };

    clearDevicePairingSimulation(row.id);

    setRecords((previous) => ({
      ...previous,
      "device-management": previous["device-management"].map((item) =>
        item.id === row.id ? pendingDevice : item
      ),
    }));

    setDevicePairingRequest((current) =>
      current?.rowId === row.id ? null : current
    );
    setPairingCodePopup(pendingDevice);
    scheduleDevicePairingSimulation(pendingDevice);
  }

  function confirmDeviceStatusChange() {
    const { rowId, nextStatus } = deviceStatusConfirmation;

    if (!rowId) {
      cancelDeviceStatusChange();
      return;
    }

    if (nextStatus === "Disconnected") {
      handleDisconnectToDisconnected(rowId);
      return;
    }

    const row = records["device-management"].find((item) => item.id === rowId);
    if (nextStatus === "Connected" && row?.status === "Disconnected") {
      handleStartDevicePendingPairing(row, true);
      cancelDeviceStatusChange();
      return;
    }

    applyDeviceStatusChange(rowId, nextStatus);
    cancelDeviceStatusChange();
  }

  function closeDevicePairingRequest() {
    setDevicePairingRequest(null);
  }

  function declineDevicePairingRequest() {
    setDevicePairingRequest(null);
  }

  function confirmDevicePairingRequest() {
    if (!devicePairingRequest?.rowId) {
      closeDevicePairingRequest();
      return;
    }

    const row = records["device-management"].find(
      (item) => item.id === devicePairingRequest.rowId
    );
    if (!row || row.status !== "Pending") {
      setDevicePairingRequest(null);
      return;
    }
    if (isDevicePairingExpired(row)) {
      clearDevicePairingSimulation(row.id);
      setRecords((previous) => ({
        ...previous,
        "device-management": previous["device-management"].map((item) =>
          item.id === row.id ? expirePendingDevice(item) : item
        ),
      }));
      setPairingCodePopup((current) =>
        current?.id === row.id ? null : current
      );
      setDevicePairingRequest(null);
      return;
    }
    const actualDeviceName =
      devicePairingRequest.actualDeviceName ?? devicePairingRequest.deviceName;
    const nextConnectedDevices = [
      ...(Array.isArray(row?.connectedDevices) ? row.connectedDevices : []),
      ...(actualDeviceName ? [actualDeviceName] : []),
    ].filter((value, index, self) => value && self.indexOf(value) === index);

    applyDeviceStatusChange(devicePairingRequest.rowId, "Connected", {
      deviceConnected: actualDeviceName,
      deviceOs: devicePairingRequest.deviceOs,
      connectedDevices: nextConnectedDevices,
    });
    setDevicePairingRequest(null);
  }

  function handleDeleteRow(pageId, rowId, itemLabel = "") {
    if (pageId === "device-management") {
      clearDevicePairingSimulation(rowId);
      if (pairingCodePopup?.id === rowId) {
        setPairingCodePopup(null);
      }
      if (devicePairingRequest?.rowId === rowId) {
        setDevicePairingRequest(null);
      }
      if (deviceStatusConfirmation.rowId === rowId) {
        cancelDeviceStatusChange();
      }
    }

    if (pageId === "category" && categoryDetailId === rowId) {
      resetCategoryDetailState();
    }
    if (pageId === "unit" && unitDetailId === rowId) {
      resetUnitDetailState();
    }
    if (pageId === "modifier" && modifierDetailId === rowId) {
      resetModifierDetailState();
    }
    if (pageId === "catalog" && catalogDetailDraft?.id === rowId) {
      resetCatalogDetailState();
    }
    if (pageId === "selling-time" && sellingTimeDetailId === rowId) {
      resetSellingTimeDetailState();
    }
    if (pageId === "pricing-rule" && pricingRuleDetailId === rowId) {
      resetPricingRuleDetailState();
    }
    if (pageId === "role-access" && roleAccessDetailId === rowId) {
      resetRoleAccessDetailState();
    }
    const deletedUnitRecord =
      pageId === "unit" ? (records.unit || []).find((row) => row.id === rowId) : null;
    const fallbackUnitName =
      deletedUnitRecord && deletedUnitRecord.name
        ? records.unit.find((row) => row.id !== rowId)?.name ?? "Pcs"
        : null;
    const deletedCategoryRecord =
      pageId === "category" ? (records.category || []).find((row) => row.id === rowId) : null;
    const deletedCatalogRecord =
      pageId === "catalog" ? (records.catalog || []).find((row) => row.id === rowId) : null;
    const deletedDeviceRecord =
      pageId === "device-management"
        ? (records["device-management"] || []).find((row) => row.id === rowId)
        : null;
    const isKdsDevice =
      deletedDeviceRecord?.deviceType === "Kitchen Display System (KDS)";
    const activeCatalogDetailDraft = catalogDetailDraftRef.current;
    const shouldSyncPackageDetailDraft =
      Boolean(deletedCatalogRecord) &&
      Boolean(activeCatalogDetailDraft) &&
      activeCatalogDetailDraft.id !== rowId &&
      activeCatalogDetailDraft.type === "package" &&
      Array.isArray(activeCatalogDetailDraft.packageItems);
    const nextCatalogDetailDraft = shouldSyncPackageDetailDraft
      ? {
        ...activeCatalogDetailDraft,
        packageItems: normalizePackageItems(
          activeCatalogDetailDraft.packageItems.filter(
            (item) => item.catalogId !== deletedCatalogRecord.name
          )
        ),
      }
      : null;
    setRecords((previous) => ({
      ...previous,
      [pageId]: previous[pageId].filter((row) => row.id !== rowId),
      ...(deletedUnitRecord
        ? {
          catalog: previous.catalog.map((row) =>
            (row.unit || "Pcs") === deletedUnitRecord.name
              ? { ...row, unit: fallbackUnitName }
              : row
          ),
        }
        : {}),
      ...(deletedCategoryRecord
        ? {
          category: previous.category
            .filter((row) => row.id !== rowId)
            .map((row) =>
              row.parentCategory === deletedCategoryRecord.name
                ? { ...row, parentCategory: "", color: deletedCategoryRecord.color }
                : row
            ),
          catalog: previous.catalog.map((row) =>
            (row.category || "Uncategorized") === deletedCategoryRecord.name
              ? { ...row, category: "" }
              : row
          ),
        }
        : {}),
      ...(deletedCatalogRecord
        ? {
          catalog: previous.catalog
            .filter((row) => row.id !== rowId)
            .map((row) =>
              row.type === "package" && Array.isArray(row.packageItems)
                ? {
                  ...row,
                  packageItems: normalizePackageItems(
                    row.packageItems.filter(
                      (item) => item.catalogId !== deletedCatalogRecord.name
                    )
                  ),
                }
                : row
            ),
          "grouped-device": (previous["grouped-device"] || []).map((group) => ({
            ...group,
            catalogList: (group.catalogList || []).filter((value) => {
              const normalizedValue = String(value ?? "");
              return (
                normalizedValue !== String(deletedCatalogRecord.id) &&
                normalizedValue !== String(deletedCatalogRecord.name)
              );
            }),
          })),
        }
        : {}),
      ...(isKdsDevice
        ? {
          "grouped-device": (previous["grouped-device"] || [])
            .map((group) => {
              const remainingDeviceRows = (previous["device-management"] || []).filter(
                (d) => d.id !== rowId
              );
              const remainingDeviceList = (group.deviceList || []).filter(
                (v) => v !== rowId && v !== deletedDeviceRecord.deviceName
              );
              const remainingKdsDevices = getNormalizedGroupedDeviceTabletRows(
                remainingDeviceRows,
                remainingDeviceList
              );
              if (remainingKdsDevices.length === 0) return null;
              return { ...group, deviceList: remainingDeviceList };
            })
            .filter(Boolean),
        }
        : {}),
      ...(deletedDeviceRecord
        ? {
          "device-management": previous["device-management"]
            .filter((row) => row.id !== rowId)
            .map((row) => {
              if (!Array.isArray(row.connectedDevices) || !row.connectedDevices.length) return row;
              const deletedIdx = row.connectedDevices.findIndex(
                (v) => v === rowId || v === deletedDeviceRecord.deviceName
              );
              if (deletedIdx === -1) return row;
              const nextConnectedDevices = row.connectedDevices.filter((_, i) => i !== deletedIdx);
              let nextDeviceConnected = row.deviceConnected;
              if (row.deviceType === "Printer" && row.deviceConnected) {
                const hwNames = String(row.deviceConnected).split(",").map((s) => s.trim());
                hwNames.splice(deletedIdx, 1);
                nextDeviceConnected = hwNames.filter(Boolean).join(", ") || null;
              } else if (!nextConnectedDevices.length) {
                nextDeviceConnected = null;
              }
              return { ...row, connectedDevices: nextConnectedDevices, deviceConnected: nextDeviceConnected };
            }),
        }
        : {}),
    }));
    setSelectedRows((previous) => ({
      ...previous,
      [pageId]: previous[pageId].filter((id) => id !== rowId),
    }));
    if (nextCatalogDetailDraft) {
      setCatalogDetailDraft(nextCatalogDetailDraft);
      catalogDetailDraftRef.current = nextCatalogDetailDraft;
      if (catalogDetailSnapshotRef.current?.id === activeCatalogDetailDraft.id) {
        const nextSnapshot = {
          ...catalogDetailSnapshotRef.current,
          packageItems: nextCatalogDetailDraft.packageItems,
        };
        setCatalogDetailSnapshot(nextSnapshot);
        catalogDetailSnapshotRef.current = nextSnapshot;
      }
    }
    showSnackbar(itemLabel ? `${itemLabel} has been deleted` : "Data has been deleted", "black");
  }

  function handleToggleAllPricingOverrides(sectionKey, groups) {
    const itemIds = groups.flatMap((group) =>
      group.items.map((item) => item.id)
    );

    setSelectedPricingOverrides((previous) => {
      const hasAll =
        itemIds.length > 0 &&
        itemIds.every((id) => previous[sectionKey].includes(id));
      return { ...previous, [sectionKey]: hasAll ? [] : itemIds };
    });
  }

  function handleTogglePricingOverrideGroup(sectionKey, group) {
    const itemIds = group.items.map((item) => item.id);

    setSelectedPricingOverrides((previous) => {
      const next = new Set(previous[sectionKey]);
      const hasAll = itemIds.every((id) => next.has(id));

      itemIds.forEach((id) => {
        if (hasAll) {
          next.delete(id);
        } else {
          next.add(id);
        }
      });

      return { ...previous, [sectionKey]: Array.from(next) };
    });
  }

  function handleTogglePricingOverrideItem(sectionKey, itemId) {
    setSelectedPricingOverrides((previous) => {
      const next = new Set(previous[sectionKey]);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return { ...previous, [sectionKey]: Array.from(next) };
    });
  }

  function handleStartPricingOverrideEdit(sectionKey, itemId) {
    const isSameItem =
      pricingOverrideEditing?.sectionKey === sectionKey &&
      pricingOverrideEditing?.itemId === itemId;

    if (isSameItem) {
      return;
    }

    if (pricingOverrideEditing) {
      handleSavePricingOverrideEdit();
    }

    const item = findPricingOverrideItem(
      pricingOverridesBySection[sectionKey] ?? [],
      itemId
    );

    setPricingOverrideEditing({
      sectionKey,
      itemId,
      value: item?.maximum === "0" ? "" : item?.maximum ?? "",
    });
  }

  function handleChangePricingOverrideEdit(value) {
    setPricingOverrideEditing((previous) =>
      previous
        ? {
          ...previous,
          value: normalizePricingOverrideEditInput(value),
        }
        : previous
    );
  }

  function handleCancelPricingOverrideEdit() {
    setPricingOverrideEditing(null);
  }

  function handleSavePricingOverrideEdit() {
    if (!pricingOverrideEditing) return;

    const { sectionKey, itemId, value } = pricingOverrideEditing;
    const nextMaximum = normalizePricingOverrideMaximumValue(value);

    const nextSections = {
      ...pricingOverridesBySection,
      [sectionKey]: (pricingOverridesBySection[sectionKey] ?? []).map(
        (group) => ({
          ...group,
          items: group.items.map((item) =>
            item.id === itemId ? { ...item, maximum: nextMaximum } : item
          ),
        })
      ),
    };

    setPricingOverridesBySection(nextSections);
    setRecords((previous) => ({
      ...previous,
      catalog: previous.catalog.map((row) => ({
        ...row,
        assignedUnits: syncAssignedUnitsWithPricingOverridesFromSections(
          row.assignedUnits ?? [],
          "catalog",
          nextSections
        ),
      })),
      modifier: previous.modifier.map((row) => ({
        ...row,
        assignedUnits: syncAssignedUnitsWithPricingOverridesFromSections(
          row.assignedUnits ?? [],
          "modifier",
          nextSections
        ),
      })),
    }));
    setCatalogDraft((previous) => ({
      ...previous,
      assignedUnits: syncAssignedUnitsWithPricingOverridesFromSections(
        previous.assignedUnits,
        "catalog",
        nextSections
      ),
    }));

    if (catalogDetailDraftRef.current) {
      const nextCatalogDetailDraft = {
        ...catalogDetailDraftRef.current,
        assignedUnits: syncAssignedUnitsWithPricingOverridesFromSections(
          catalogDetailDraftRef.current.assignedUnits,
          "catalog",
          nextSections
        ),
      };
      setCatalogDetailDraft(nextCatalogDetailDraft);
      catalogDetailDraftRef.current = nextCatalogDetailDraft;
    }

    if (sectionKey === "modifier") {
      setModifierDraft((previous) => ({
        ...previous,
        assignedUnits: syncAssignedUnitsWithPricingOverridesFromSections(
          previous.assignedUnits,
          "modifier",
          nextSections
        ),
      }));

      if (modifierDetailDraftRef.current) {
        const nextModifierDetailDraft = {
          ...modifierDetailDraftRef.current,
          assignedUnits: syncAssignedUnitsWithPricingOverridesFromSections(
            modifierDetailDraftRef.current.assignedUnits,
            "modifier",
            nextSections
          ),
        };
        setModifierDetailDraft(nextModifierDetailDraft);
        modifierDetailDraftRef.current = nextModifierDetailDraft;
      }
    }

    setPricingOverrideEditing(null);
  }

  function handleDownloadPage(pageId) {
    const rows = getRowsForPage(pageId);
    if (!rows.length) {
      showSnackbar("Nothing to export for the current filters", "red");
      return;
    }

    const columns =
      pageId === "catalog"
        ? ["name", "category", "basePrice", "sellingTime", "availability"]
        : (PAGE_CONFIGS[pageId]?.columns || [])
          .filter((column) => column.type !== "delete")
          .map((column) => column.key);

    const csv = [
      columns.join(","),
      ...rows.map((row) =>
        columns
          .map((key) => `"${String(row[key]).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${pageId}-export.csv`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
    showSnackbar(`${pageId.replace(/-/g, " ")} export downloaded`, "green");
  }

  function handleSettingChange(key, value) {
    setSettingsForm((previous) => ({ ...previous, [key]: value }));
  }

  function handleSettingToggle(key) {
    setSettingsForm((previous) => ({ ...previous, [key]: !previous[key] }));
    showSnackbar("Setting updated", "black");
  }

  function buildCatalogRecordForStorage(detailRecord) {
    const cleanedPackageItems =
      detailRecord.type === "package"
        ? detailRecord.packageItems
          .filter((item) => item.catalogId)
          .map((item) => ({ ...item, qty: item.qty || "1" }))
        : [];
    const enteredPrice = Number(
      String(detailRecord.price ?? "").replace(/[^\d]/g, "") || 0
    );
    const fallbackPrice =
      detailRecord.type === "package"
        ? getPackageTotalForItems(cleanedPackageItems)
        : 0;
    const basePrice = enteredPrice > 0 ? enteredPrice : fallbackPrice;
    const assignedUnits = syncAssignedUnitsWithPricingOverrides(
      detailRecord.assignedUnits ?? [],
      "catalog"
    ).map((unit) => {
      const { overridePriceInput, ...rest } = unit;
      const normalizedDigits = String(overridePriceInput ?? "").replace(
        /[^\d]/g,
        ""
      );
      const overridePrice =
        rest.maxOverridePrice === "Not Allowed"
          ? "-"
          : overridePriceInput !== undefined
            ? normalizedDigits
              ? formatIdr(Number(normalizedDigits))
              : "-"
            : rest.overridePrice || "-";

      return {
        ...rest,
        overridePrice,
      };
    });
    const normalizedAssignedUnits = normalizeCatalogAssignedUnits(assignedUnits);

    return {
      ...detailRecord,
      name: detailRecord.name.trim(),
      additionalNames: (detailRecord.additionalNames ?? [])
        .filter((entry) => entry.value.trim())
        .map((entry) => ({ id: entry.id, value: entry.value.trim() })),
      description: String(detailRecord.description ?? "").trim(),
      unit: detailRecord.unit || "Pcs",
      category: getCatalogCategoryForType(
        detailRecord.type,
        detailRecord.category
      ),
      basePrice,
      price: String(enteredPrice > 0 ? enteredPrice : basePrice),
      priceRule: detailRecord.allowOverridePrice
        ? "Override Enabled"
        : "Standard",
      modifier:
        detailRecord.type === "single"
          ? [...(detailRecord.modifier ?? [])]
          : [],
      packageItems: cleanedPackageItems,
      assignedUnits: normalizedAssignedUnits,
      photos: cloneCatalogPhotos(detailRecord.photos ?? []),
      trackStock: detailRecord.type === "single" && detailRecord.trackStock,
      ingredients:
        detailRecord.type === "single"
          ? detailRecord.ingredients
            .filter((item) => item.name)
            .map((item) => ({ ...item, qty: item.qty || "1" }))
          : [],
      preparationTime: String(detailRecord.preparationTime ?? "").replace(/[^\d]/g, ""),
      routing: detailRecord.routing || "KDS Kitchen",
    };
  }


  function persistCatalogDetailDraft(nextDraft, snackbarMessage = null) {
    const storedRecord = buildCatalogRecordForStorage(nextDraft);
    const normalizedDraft = createCatalogDetailDraftFromRecord(storedRecord);

    setRecords((previous) => ({
      ...previous,
      catalog: previous.catalog.map((item) =>
        item.id === storedRecord.id ? { ...item, ...storedRecord } : item
      ),
    }));
    setCatalogDetailDraft(normalizedDraft);
    catalogDetailDraftRef.current = normalizedDraft;

    if (snackbarMessage) {
      showSnackbar(snackbarMessage, "black");
    }

    return normalizedDraft;
  }

  function resetCatalogDetailState() {
    setCatalogDetailDraft(null);
    setCatalogDetailPanelTab("general");
    setCatalogDetailEditing(null);
    setCatalogDetailSnapshot(null);
    catalogDetailDraftRef.current = null;
    catalogDetailEditingRef.current = null;
    catalogDetailSnapshotRef.current = null;
  }

  function openCatalogDetailPage(rowId, { skipCreateGuard = false } = {}) {
    if (
      !skipCreateGuard &&
      guardCreatePanelNavigation(() =>
        openCatalogDetailPage(rowId, { skipCreateGuard: true })
      )
    ) {
      return;
    }

    const row = (records.catalog || []).find((item) => item.id === rowId);
    if (!row) return;

    if (currentPage !== "catalog" && currentPage !== "catalog-detail") {
      handleSetPage("catalog", { skipCreateGuard: true });
    }

    const nextDraft = createCatalogDetailDraftFromRecord(row);
    setCatalogDetailDraft(nextDraft);
    setCatalogDetailPanelTab("general");
    setCatalogDetailEditing(null);
    setCatalogDetailSnapshot(null);
    catalogDetailDraftRef.current = nextDraft;
    catalogDetailEditingRef.current = null;
    catalogDetailSnapshotRef.current = null;
  }

  function closeCatalogDetailPage() {
    const shouldNavigateBack = currentPage === "catalog-detail";
    resetCatalogDetailState();
    if (shouldNavigateBack) {
      handleSetPage("catalog");
    }
  }

  function persistCategoryDetailDraft(nextDraft, snackbarMessage = null) {
    const currentRecord = (records.category || []).find(
      (item) => item.id === nextDraft.id
    );
    if (!currentRecord) return nextDraft;

    const previousName = currentRecord.name;
    const normalizedName = nextDraft.name.trim();
    const normalizedParentCategory =
      nextDraft.parentCategory === "None (Main Category)"
        ? ""
        : nextDraft.parentCategory;

    const storedRecord = {
      ...currentRecord,
      name: normalizedName,
      parentCategory: normalizedParentCategory,
      sellingTime: nextDraft.sellingTime,
      color: nextDraft.color,
    };

    setRecords((previous) => ({
      ...previous,
      category: previous.category.map((item) => {
        if (item.id === storedRecord.id) return storedRecord;
        if (item.parentCategory === previousName) {
          return { ...item, parentCategory: normalizedName };
        }
        return item;
      }),
      catalog: previous.catalog.map((item) =>
        item.category === previousName
          ? { ...item, category: normalizedName }
          : item
      ),
    }));

    const normalizedDraft = createCategoryDetailDraftFromRecord(storedRecord);
    setCategoryDetailDraft(normalizedDraft);
    categoryDetailDraftRef.current = normalizedDraft;

    if (snackbarMessage) {
      showSnackbar(snackbarMessage, "black");
    }

    return normalizedDraft;
  }

  function resetCategoryDetailState() {
    setCategoryDetailId(null);
    setCategoryDetailDraft(null);
    setCategoryDetailEditing(null);
    setCategoryDetailErrors({});
    setCategoryDetailSnapshot(null);
    categoryDetailDraftRef.current = null;
    categoryDetailEditingRef.current = null;
    categoryDetailSnapshotRef.current = null;
  }

  function persistUnitDetailDraft(nextDraft, snackbarMessage = null) {
    const currentRecord = (records.unit || []).find((item) => item.id === nextDraft.id);
    if (!currentRecord) return nextDraft;

    const previousName = currentRecord.name;
    const storedRecord = {
      ...currentRecord,
      name: nextDraft.name.trim(),
      precision: normalizeUnitPrecisionOption(nextDraft.precision),
    };

    setRecords((previous) => ({
      ...previous,
      unit: previous.unit.map((item) =>
        item.id === storedRecord.id ? storedRecord : item
      ),
      catalog: previous.catalog.map((item) =>
        (item.unit || "Pcs") === previousName
          ? { ...item, unit: storedRecord.name }
          : item
      ),
    }));

    const normalizedDraft = createUnitDetailDraftFromRecord(storedRecord);
    setUnitDetailDraft(normalizedDraft);
    unitDetailDraftRef.current = normalizedDraft;

    if (snackbarMessage) {
      showSnackbar(snackbarMessage, "black");
    }

    return normalizedDraft;
  }

  function resetUnitDetailState() {
    setUnitDetailId(null);
    setUnitDetailDraft(null);
    setUnitDetailEditing(null);
    setUnitDetailErrors({});
    setUnitDetailSnapshot(null);
    unitDetailDraftRef.current = null;
    unitDetailEditingRef.current = null;
    unitDetailSnapshotRef.current = null;
  }

  function resetSellingTimeDetailState() {
    setSellingTimeDetailId(null);
    setSellingTimeDetailDraft(null);
    setSellingTimeDetailEditing(null);
    setSellingTimeDetailErrors({});
    setSellingTimeDetailSnapshot(null);
    sellingTimeDetailDraftRef.current = null;
    sellingTimeDetailEditingRef.current = null;
    sellingTimeDetailSnapshotRef.current = null;
  }

  function clearSellingTimeDetailError(...keys) {
    setSellingTimeDetailErrors((previous) => {
      const next = { ...previous };
      let hasChanges = false;

      keys.forEach((key) => {
        if (next[key]) {
          delete next[key];
          hasChanges = true;
        }
      });

      return hasChanges ? next : previous;
    });
  }

  function clearSellingTimeDetailErrorsByPrefix(prefix) {
    setSellingTimeDetailErrors((previous) => {
      const next = { ...previous };
      let hasChanges = false;

      Object.keys(next).forEach((key) => {
        if (key.startsWith(prefix)) {
          delete next[key];
          hasChanges = true;
        }
      });

      return hasChanges ? next : previous;
    });
  }

  function openSellingTimeDetailPanel(
    rowId,
    { skipCreateGuard = false } = {}
  ) {
    if (
      !skipCreateGuard &&
      guardCreatePanelNavigation(() =>
        openSellingTimeDetailPanel(rowId, { skipCreateGuard: true })
      )
    ) {
      return;
    }

    const currentDraft = sellingTimeDetailDraftRef.current;
    const currentEditing = sellingTimeDetailEditingRef.current;

    if (currentDraft && currentEditing) {
      const result = commitSellingTimeDetailEdit(
        currentDraft,
        currentEditing,
        "Selling time updated",
        { showSuccess: false }
      );
      if (!result.ok) return;
    }

    const row = records["selling-time"].find((item) => item.id === rowId);
    if (!row) return;

    if (currentPage !== "selling-time") {
      handleSetPage("selling-time", { skipCreateGuard: true });
    }

    const nextDraft = createSellingTimeDetailDraftFromRecord(row);
    setSellingTimeDetailId(rowId);
    setSellingTimeDetailDraft(nextDraft);
    setSellingTimeDetailEditing(null);
    setSellingTimeDetailErrors({});
    setSellingTimeDetailSnapshot(null);
    sellingTimeDetailDraftRef.current = nextDraft;
    sellingTimeDetailEditingRef.current = null;
    sellingTimeDetailSnapshotRef.current = null;
  }

  function closeSellingTimeDetailPanel() {
    resetSellingTimeDetailState();
  }

  function buildSellingTimeDetailRecordForStorage(detailDraft) {
    const normalizedSchedule = (detailDraft.days ?? []).map((day) => {
      const normalizedSlots = day.enabled
        ? day.is24Hours
          ? [{ id: `${day.id}-24-hours`, start: "00:00", end: "23:59" }]
          : (day.slots ?? []).map((slot, index) => ({
            id: slot?.id ?? `${day.id}-slot-${index + 1}`,
            start: slot?.start ?? "",
            end: slot?.end ?? "",
          }))
        : [];

      return {
        id: day.id,
        label: day.label,
        enabled: Boolean(day.enabled),
        is24Hours: Boolean(day.enabled && day.is24Hours),
        slots: normalizedSlots,
      };
    });
    const activeDays = normalizedSchedule
      .filter((day) => day.enabled)
      .map((day) => day.label);

    return {
      id: detailDraft.id,
      name: detailDraft.name.trim(),
      days: activeDays,
      schedule: normalizedSchedule,
    };
  }

  function persistSellingTimeDetailDraft(nextDraft, snackbarMessage = null) {
    const currentRecord = records["selling-time"].find(
      (item) => item.id === nextDraft.id
    );
    if (!currentRecord) return nextDraft;

    const storedRecord = {
      ...currentRecord,
      ...buildSellingTimeDetailRecordForStorage(nextDraft),
    };

    setRecords((previous) => ({
      ...previous,
      "selling-time": previous["selling-time"].map((item) =>
        item.id === storedRecord.id ? storedRecord : item
      ),
    }));

    const normalizedDraft =
      createSellingTimeDetailDraftFromRecord(storedRecord);
    setSellingTimeDetailDraft(normalizedDraft);
    sellingTimeDetailDraftRef.current = normalizedDraft;

    if (snackbarMessage) {
      showSnackbar(snackbarMessage, "black");
    }

    return normalizedDraft;
  }

  function commitPricingRuleDetailEdit(
    detailDraft,
    detailEditing,
    message = "Special pricing rule updated",
    { showSuccess = true } = {}
  ) {
    if (!detailDraft || !detailEditing) {
      return { ok: true, nextDraft: detailDraft };
    }

    const validationMessage = getPricingRuleDetailValidationMessage(
      detailDraft,
      detailEditing
    );
    if (validationMessage) {
      const nextErrors = {};
      if (!detailDraft.name.trim()) {
        nextErrors.name = true;
      }
      if (!String(detailDraft.startDate ?? "").trim()) {
        nextErrors.startDate = true;
      }
      if (!String(detailDraft.endDate ?? "").trim()) {
        nextErrors.endDate = true;
      }
      setPricingRuleDetailErrors(nextErrors);
      showSnackbar(validationMessage, "red");
      return { ok: false, nextDraft: detailDraft };
    }

    const duplicateNameError = getDuplicatePricingRuleNameError(
      detailDraft.name,
      detailDraft.id
    );
    if (duplicateNameError) {
      setPricingRuleDetailErrors({ name: duplicateNameError });
      return { ok: false, nextDraft: detailDraft };
    }

    const nextDraft = persistPricingRuleDetailDraft(
      detailDraft,
      showSuccess ? message : null
    );
    setPricingRuleDetailEditing(null);
    setPricingRuleDetailErrors({});
    setPricingRuleDetailSnapshot(null);
    pricingRuleDetailEditingRef.current = null;
    pricingRuleDetailSnapshotRef.current = null;

    return { ok: true, nextDraft };
  }

  function startPricingRuleDetailEdit(nextEditing) {
    let nextDraft = pricingRuleDetailDraftRef.current;
    const currentEditing = pricingRuleDetailEditingRef.current;

    if (!nextDraft) return false;
    if (isSamePricingRuleDetailEditing(currentEditing, nextEditing)) {
      return true;
    }

    if (currentEditing) {
      const result = commitPricingRuleDetailEdit(
        nextDraft,
        currentEditing,
        "Special pricing rule updated",
        { showSuccess: false }
      );
      if (!result.ok) return false;
      nextDraft = result.nextDraft;
    }

    const snapshot = clonePricingRuleDetailDraftState(nextDraft);
    setPricingRuleDetailSnapshot(snapshot);
    setPricingRuleDetailErrors({});
    setPricingRuleDetailEditing(nextEditing);
    pricingRuleDetailSnapshotRef.current = snapshot;
    pricingRuleDetailEditingRef.current = nextEditing;
    return true;
  }

  function beginPricingRuleDetailEdit(nextEditing) {
    if (isLockedSelectedBusinessUnit) return;
    startPricingRuleDetailEdit(nextEditing);
  }

  function cancelPricingRuleDetailEdit() {
    const isDirty = hasDraftChanges(
      pricingRuleDetailDraftRef.current,
      pricingRuleDetailSnapshotRef.current
    );
    if (isDirty) {
      discardEditActionRef.current = executeCancelPricingRuleDetailEdit;
      setDiscardEditModalOpen(true);
      return;
    }
    executeCancelPricingRuleDetailEdit();
  }

  function executeCancelPricingRuleDetailEdit() {
    if (pricingRuleDetailSnapshotRef.current) {
      setPricingRuleDetailDraft(pricingRuleDetailSnapshotRef.current);
      pricingRuleDetailDraftRef.current = pricingRuleDetailSnapshotRef.current;
    }
    setPricingRuleDetailEditing(null);
    setPricingRuleDetailErrors({});
    setPricingRuleDetailSnapshot(null);
    pricingRuleDetailEditingRef.current = null;
    pricingRuleDetailSnapshotRef.current = null;
  }

  function savePricingRuleDetailEdit(
    message = "Special pricing rule updated",
    options = {}
  ) {
    return commitPricingRuleDetailEdit(
      pricingRuleDetailDraftRef.current,
      pricingRuleDetailEditingRef.current,
      message,
      options
    ).ok;
  }

  function handlePricingRuleDetailChange(key, value) {
    const normalizedValue =
      key === "name" ? String(value ?? "").slice(0, 80) : value;

    setPricingRuleDetailDraft((previous) => {
      const nextDraft = previous
        ? {
          ...previous,
          [key]: normalizedValue,
        }
        : previous;
      pricingRuleDetailDraftRef.current = nextDraft;
      return nextDraft;
    });
    clearPricingRuleDetailError(key);
  }

  function handlePricingRuleDetailMaximumChange(sectionKey, itemId, value) {
    const normalizedValue = normalizePricingOverrideEditInput(value);

    setPricingRuleDetailDraft((previous) => {
      if (!previous) return previous;

      const nextDraft = {
        ...previous,
        overrides: {
          ...previous.overrides,
          [sectionKey]: (previous.overrides?.[sectionKey] ?? []).map(
            (group) => ({
              ...group,
              items: group.items.map((item) =>
                item.id === itemId
                  ? { ...item, maximum: normalizedValue || "0" }
                  : item
              ),
            })
          ),
        },
      };
      pricingRuleDetailDraftRef.current = nextDraft;
      return nextDraft;
    });
  }

  function commitSellingTimeDetailEdit(
    detailDraft,
    detailEditing,
    message = "Selling time updated",
    { showSuccess = true } = {}
  ) {
    if (!detailDraft || !detailEditing) {
      return { ok: true, nextDraft: detailDraft };
    }

    const validationMessage = getSellingTimeDetailValidationMessage(
      detailDraft,
      detailEditing
    );
    const validationErrors = getSellingTimeDetailValidationErrors(
      detailDraft,
      detailEditing
    );
    if (validationMessage) {
      setSellingTimeDetailErrors(validationErrors);
      showSnackbar(validationMessage, "red");
      return { ok: false, nextDraft: detailDraft };
    }

    const nextDraft = persistSellingTimeDetailDraft(
      detailDraft,
      showSuccess ? message : null
    );
    setSellingTimeDetailEditing(null);
    setSellingTimeDetailErrors({});
    setSellingTimeDetailSnapshot(null);
    sellingTimeDetailEditingRef.current = null;
    sellingTimeDetailSnapshotRef.current = null;

    return { ok: true, nextDraft };
  }

  function startSellingTimeDetailEdit(nextEditing, { prepareDraft } = {}) {
    let nextDraft = sellingTimeDetailDraftRef.current;
    const currentEditing = sellingTimeDetailEditingRef.current;

    if (!nextDraft) return false;
    if (isSameSellingTimeDetailEditing(currentEditing, nextEditing)) {
      return true;
    }

    if (currentEditing) {
      const result = commitSellingTimeDetailEdit(
        nextDraft,
        currentEditing,
        "Selling time updated",
        { showSuccess: false }
      );
      if (!result.ok) return false;
      nextDraft = result.nextDraft;
    }

    if (prepareDraft) {
      nextDraft = prepareDraft(nextDraft);
      setSellingTimeDetailDraft(nextDraft);
      sellingTimeDetailDraftRef.current = nextDraft;
    }

    const snapshot = cloneSellingTimeDetailDraftState(nextDraft);
    setSellingTimeDetailSnapshot(snapshot);
    setSellingTimeDetailEditing(nextEditing);
    sellingTimeDetailSnapshotRef.current = snapshot;
    sellingTimeDetailEditingRef.current = nextEditing;
    return true;
  }

  function beginSellingTimeDetailEdit(nextEditing) {
    if (isLockedSelectedBusinessUnit) return;
    startSellingTimeDetailEdit(nextEditing);
  }

  function cancelSellingTimeDetailEdit() {
    const isDirty = hasDraftChanges(
      sellingTimeDetailDraftRef.current,
      sellingTimeDetailSnapshotRef.current
    );
    if (isDirty) {
      discardEditActionRef.current = executeCancelSellingTimeDetailEdit;
      setDiscardEditModalOpen(true);
      return;
    }
    executeCancelSellingTimeDetailEdit();
  }

  function executeCancelSellingTimeDetailEdit() {
    if (sellingTimeDetailSnapshotRef.current) {
      setSellingTimeDetailDraft(sellingTimeDetailSnapshotRef.current);
      sellingTimeDetailDraftRef.current = sellingTimeDetailSnapshotRef.current;
    }
    setSellingTimeDetailEditing(null);
    setSellingTimeDetailErrors({});
    setSellingTimeDetailSnapshot(null);
    sellingTimeDetailEditingRef.current = null;
    sellingTimeDetailSnapshotRef.current = null;
  }

  function saveSellingTimeDetailEdit(
    message = "Selling time updated",
    options = {}
  ) {
    return commitSellingTimeDetailEdit(
      sellingTimeDetailDraftRef.current,
      sellingTimeDetailEditingRef.current,
      message,
      options
    ).ok;
  }

  function handleSellingTimeDetailChange(key, value) {
    const normalizedValue =
      key === "name" ? String(value ?? "").slice(0, 30) : value;

    setSellingTimeDetailDraft((previous) => {
      const nextDraft = previous
        ? {
          ...previous,
          [key]: normalizedValue,
        }
        : previous;
      sellingTimeDetailDraftRef.current = nextDraft;
      return nextDraft;
    });
  }

  function handleToggleSellingTimeDetailDay(dayId) {
    updateSellingTimeDetailDay(dayId, (day) => {
      const nextEnabled = !day.enabled;
      const nextManualSlots = day.is24Hours
        ? cloneSellingTimeSlots(day.manualSlots)
        : cloneSellingTimeSlots(day.slots);

      return {
        ...day,
        enabled: nextEnabled,
        is24Hours: false,
        manualSlots: nextManualSlots,
        slots: nextEnabled
          ? cloneSellingTimeSlots(nextManualSlots)
          : cloneSellingTimeSlots(nextManualSlots),
      };
    });
    clearSellingTimeDetailErrorsByPrefix(getSellingTimeDayErrorPrefix(dayId));
  }

  function updateSellingTimeDetailDay(dayId, updater) {
    setSellingTimeDetailDraft((previous) => {
      if (!previous) return previous;

      const nextDraft = {
        ...previous,
        days: previous.days.map((day) =>
          day.id === dayId ? updater(day) : day
        ),
      };
      sellingTimeDetailDraftRef.current = nextDraft;
      return nextDraft;
    });
  }

  function handleSellingTimeDetailToggle24Hours(dayId) {
    updateSellingTimeDetailDay(dayId, (day) => {
      const nextChecked = !day.is24Hours;
      const preservedManualSlots = day.is24Hours
        ? cloneSellingTimeSlots(day.manualSlots)
        : cloneSellingTimeSlots(day.slots);

      return {
        ...day,
        enabled: true,
        is24Hours: nextChecked,
        manualSlots: preservedManualSlots,
        slots: nextChecked
          ? [
            {
              id:
                day.slots?.[0]?.id ??
                nextCatalogBuilderId("selling-time-slot"),
              start: "00:00",
              end: "23:59",
            },
          ]
          : cloneSellingTimeSlots(preservedManualSlots),
      };
    });
    clearSellingTimeDetailErrorsByPrefix(getSellingTimeDayErrorPrefix(dayId));
  }

  function handleSellingTimeDetailSlotChange(dayId, slotId, key, value) {
    updateSellingTimeDetailDay(dayId, (day) => ({
      ...day,
      slots: day.slots.map((slot) =>
        slot.id === slotId ? { ...slot, [key]: value } : slot
      ),
      manualSlots: day.is24Hours
        ? day.manualSlots
        : day.slots.map((slot) =>
          slot.id === slotId ? { ...slot, [key]: value } : slot
        ),
    }));
    clearSellingTimeDetailError(getSellingTimeSlotErrorKey(dayId, slotId, key));
  }

  function handleAddSellingTimeDetailSlot(dayId) {
    const currentEditing = sellingTimeDetailEditingRef.current;
    if (
      currentEditing?.kind === "schedule-day" &&
      currentEditing.dayId === dayId
    ) {
      const nextSlot = createSellingTimeSlot("", "");
      updateSellingTimeDetailDay(dayId, (day) => ({
        ...day,
        enabled: true,
        is24Hours: false,
        slots: [...(day.slots ?? []), nextSlot],
        manualSlots: [...(day.slots ?? []), nextSlot],
      }));
      return;
    }

    const nextSlot = createSellingTimeSlot("", "");
    startSellingTimeDetailEdit(
      { kind: "schedule-day", dayId },
      {
        prepareDraft: (draft) => ({
          ...draft,
          days: draft.days.map((day) =>
            day.id === dayId
              ? {
                ...day,
                enabled: true,
                is24Hours: false,
                slots: [...(day.slots ?? []), nextSlot],
                manualSlots: [...(day.slots ?? []), nextSlot],
              }
              : day
          ),
        }),
      }
    );
  }

  function handleRemoveSellingTimeDetailSlot(dayId, slotId) {
    const currentDraft = sellingTimeDetailDraftRef.current;
    if (!currentDraft) return;

    const targetDay = currentDraft.days.find((day) => day.id === dayId);
    if (!targetDay || (targetDay.slots?.length ?? 0) <= 1) return;

    const nextDays = currentDraft.days.map((day) => {
      if (day.id !== dayId) return day;

      const remainingSlots = (day.slots ?? []).filter(
        (slot) => slot.id !== slotId
      );

      return {
        ...day,
        is24Hours: false,
        slots: remainingSlots,
        manualSlots: remainingSlots,
      };
    });

    const nextDraft = {
      ...currentDraft,
      days: nextDays,
    };

    if (
      sellingTimeDetailEditingRef.current?.kind === "schedule-day" &&
      sellingTimeDetailEditingRef.current.dayId === dayId
    ) {
      setSellingTimeDetailDraft(nextDraft);
      sellingTimeDetailDraftRef.current = nextDraft;
      clearSellingTimeDetailError(
        getSellingTimeSlotErrorKey(dayId, slotId, "start"),
        getSellingTimeSlotErrorKey(dayId, slotId, "end")
      );
      return;
    }

    clearSellingTimeDetailError(
      getSellingTimeSlotErrorKey(dayId, slotId, "start"),
      getSellingTimeSlotErrorKey(dayId, slotId, "end")
    );
    persistSellingTimeDetailDraft(nextDraft, "Selling time updated");
  }

  function buildModifierRecordForStorage(detailDraft) {
    const namedOptions = (detailDraft.options ?? [])
      .filter((option) => option?.name?.trim?.())
      .map((option) => buildModifierOptionRecordForStorage(option));
    const connectedCatalogItems = Array.isArray(detailDraft.connectedCatalog)
      ? detailDraft.connectedCatalog.filter(Boolean)
      : [];
    const connectedCatalogCount = connectedCatalogItems.length;

    return {
      id: detailDraft.id,
      name: detailDraft.name.trim(),
      modifierOptions: `${namedOptions.length} option${namedOptions.length === 1 ? "" : "s"
        }`,
      connectedCatalog: connectedCatalogCount
        ? `${connectedCatalogCount} catalog`
        : "-",
      connectedCatalogCount,
      connectedCatalogItems,
      minimumSelection: detailDraft.minimumSelection || "0",
      maximumSelection: detailDraft.maximumSelection || "0",
      allowOverridePrice: Boolean(detailDraft.allowOverridePrice),
      availability: detailDraft.availability !== false,
      assignedUnits: cloneAssignedUnits(detailDraft.assignedUnits ?? []),
      options: namedOptions,
    };
  }

  function persistModifierDetailDraft(nextDraft, snackbarMessage = null) {
    const currentRecord = (records.modifier || []).find(
      (item) => item.id === nextDraft.id
    );
    if (!currentRecord) return nextDraft;

    const storedRecord = {
      ...currentRecord,
      ...buildModifierRecordForStorage(nextDraft),
    };

    setRecords((previous) => ({
      ...previous,
      modifier: previous.modifier.map((item) =>
        item.id === storedRecord.id ? storedRecord : item
      ),
    }));

    const normalizedDraft = createModifierDetailDraftFromRecord(storedRecord);
    setModifierDetailDraft(normalizedDraft);
    modifierDetailDraftRef.current = normalizedDraft;

    if (snackbarMessage) {
      showSnackbar(snackbarMessage, "black");
    }

    return normalizedDraft;
  }

  function resetModifierDetailState() {
    setModifierDetailId(null);
    setModifierDetailPanelTab("general");
    setModifierDetailDraft(null);
    setModifierDetailEditing(null);
    setModifierDetailErrors({});
    setModifierDetailSnapshot(null);
    modifierDetailDraftRef.current = null;
    modifierDetailEditingRef.current = null;
    modifierDetailSnapshotRef.current = null;
  }

  function openModifierDetailPanel(rowId, { skipCreateGuard = false } = {}) {
    if (
      !skipCreateGuard &&
      guardCreatePanelNavigation(() =>
        openModifierDetailPanel(rowId, { skipCreateGuard: true })
      )
    ) {
      return;
    }

    const currentDraft = modifierDetailDraftRef.current;
    const currentEditing = modifierDetailEditingRef.current;

    if (currentDraft && currentEditing) {
      const result = commitModifierDetailEdit(
        currentDraft,
        currentEditing,
        "Modifier updated",
        { showSuccess: false }
      );
      if (!result.ok) return;
    }

    const row = (records.modifier || []).find((item) => item.id === rowId);
    if (!row) return;

    if (currentPage !== "modifier") {
      handleSetPage("modifier", { skipCreateGuard: true });
    }

    const nextDraft = createModifierDetailDraftFromRecord(row);
    setModifierDetailId(rowId);
    setModifierDetailPanelTab("general");
    setModifierDetailDraft(nextDraft);
    setModifierDetailEditing(null);
    setModifierDetailErrors({});
    setModifierDetailSnapshot(null);
    modifierDetailDraftRef.current = nextDraft;
    modifierDetailEditingRef.current = null;
    modifierDetailSnapshotRef.current = null;
  }

  function closeModifierDetailPanel() {
    resetModifierDetailState();
  }

  function handleRemoveModifierDetailAssignedUnit(unitId) {
    if (isLockedSelectedBusinessUnit) return;
    const currentDraft = modifierDetailDraftRef.current;
    if (!currentDraft) return;

    const nextDraft = {
      ...currentDraft,
      assignedUnits: (currentDraft.assignedUnits ?? []).filter(
        (unit) => unit.id !== unitId
      ),
    };

    if (modifierDetailEditingRef.current?.kind === "all") {
      setModifierDetailDraft(nextDraft);
      modifierDetailDraftRef.current = nextDraft;
      return;
    }

    persistModifierDetailDraft(nextDraft, "Unit assignment updated");
  }

  function commitModifierDetailEdit(
    detailDraft,
    detailEditing,
    message = "Modifier updated",
    { showSuccess = true } = {}
  ) {
    if (!detailDraft || !detailEditing) {
      return { ok: true, nextDraft: detailDraft };
    }

    const validationMessage = getModifierDetailValidationMessage(
      detailDraft,
      detailEditing
    );
    if (validationMessage) {
      const nextErrors = {};
      const emptyNameIds = getModifierOptionNameErrorIds(
        detailDraft.options ?? []
      );
      const duplicateOptionNameIds = getModifierOptionDuplicateNameIds(
        detailDraft.options ?? []
      );
      const optionNames = [...new Set([...emptyNameIds, ...duplicateOptionNameIds])];
      const optionIngredientQtys = getModifierOptionIngredientQtyErrorIds(
        detailDraft.options ?? []
      );

      if (
        detailEditing.kind === "all" ||
        (detailEditing.kind === "field" && detailEditing.field === "name")
      ) {
        if (!detailDraft.name.trim()) {
          nextErrors.name = true;
        }
        if (optionNames.length) {
          nextErrors.optionNames = optionNames;
        }
        if (optionIngredientQtys.length) {
          nextErrors.optionIngredientQtys = optionIngredientQtys;
        }
        setModifierDetailErrors(nextErrors);
      } else if (detailEditing.kind === "option-row") {
        if (optionNames.includes(detailEditing.optionId)) {
          nextErrors.optionNames = [detailEditing.optionId];
        }
        if (optionIngredientQtys.includes(detailEditing.optionId)) {
          nextErrors.optionIngredientQtys = [detailEditing.optionId];
        }
        setModifierDetailErrors(nextErrors);
      } else {
        showSnackbar(validationMessage, "red");
      }
      return { ok: false, nextDraft: detailDraft };
    }

    const nextDetailErrors = {};

    const duplicateNameError = getDuplicateModifierNameError(
      detailDraft.name,
      detailDraft.id
    );
    if (duplicateNameError) {
      nextDetailErrors.name = duplicateNameError;
    }

    if (detailEditing.kind === "all") {
      const selectionCountError = getModifierSelectionCountError(detailDraft);
      if (selectionCountError) {
        nextDetailErrors.selectionCount = selectionCountError;
      }
    }

    if (Object.keys(nextDetailErrors).length) {
      setModifierDetailErrors(nextDetailErrors);
      return { ok: false, nextDraft: detailDraft };
    }

    const nextDraft = persistModifierDetailDraft(
      detailDraft,
      showSuccess ? message : null
    );
    setModifierDetailEditing(null);
    setModifierDetailErrors({});
    setModifierDetailSnapshot(null);
    modifierDetailEditingRef.current = null;
    modifierDetailSnapshotRef.current = null;

    return { ok: true, nextDraft };
  }

  function startModifierDetailEdit(nextEditing, { prepareDraft } = {}) {
    let nextDraft = modifierDetailDraftRef.current;
    const currentEditing = modifierDetailEditingRef.current;

    if (!nextDraft) return false;
    if (isSameModifierDetailEditing(currentEditing, nextEditing)) return true;

    if (currentEditing) {
      const result = commitModifierDetailEdit(
        nextDraft,
        currentEditing,
        "Modifier updated",
        { showSuccess: false }
      );
      if (!result.ok) return false;
      nextDraft = result.nextDraft;
    }

    if (prepareDraft) {
      nextDraft = prepareDraft(nextDraft);
      setModifierDetailDraft(nextDraft);
      modifierDetailDraftRef.current = nextDraft;
    }

    const snapshot = cloneModifierDetailDraftState(nextDraft);
    setModifierDetailSnapshot(snapshot);
    setModifierDetailErrors({});
    setModifierDetailEditing(nextEditing);
    modifierDetailSnapshotRef.current = snapshot;
    modifierDetailEditingRef.current = nextEditing;
    return true;
  }

  function beginModifierDetailEdit(nextEditing) {
    if (isLockedSelectedBusinessUnit) return;
    startModifierDetailEdit(nextEditing);
  }

  function cancelModifierDetailEdit() {
    const isDirty = hasDraftChanges(
      modifierDetailDraftRef.current,
      modifierDetailSnapshotRef.current
    );
    if (isDirty) {
      discardEditActionRef.current = executeCancelModifierDetailEdit;
      setDiscardEditModalOpen(true);
      return;
    }
    executeCancelModifierDetailEdit();
  }

  function executeCancelModifierDetailEdit() {
    if (modifierDetailSnapshotRef.current) {
      setModifierDetailDraft(modifierDetailSnapshotRef.current);
      modifierDetailDraftRef.current = modifierDetailSnapshotRef.current;
    }
    setModifierDetailEditing(null);
    setModifierDetailErrors({});
    setModifierDetailSnapshot(null);
    modifierDetailEditingRef.current = null;
    modifierDetailSnapshotRef.current = null;
  }

  function saveModifierDetailEdit(message = "Modifier updated", options = {}) {
    return commitModifierDetailEdit(
      modifierDetailDraftRef.current,
      modifierDetailEditingRef.current,
      message,
      options
    ).ok;
  }

  function handleModifierDetailChange(key, value) {
    if (isLockedSelectedBusinessUnit) return;
    const normalizedValue =
      key === "name"
        ? String(value ?? "").slice(0, 40)
        : key === "connectedCatalog"
          ? Array.isArray(value)
            ? value
            : []
          : key === "minimumSelection"
            ? (() => { const n = Math.min(Number(String(value ?? "").replace(/[^\d]/g, "")) || 0, 15); return n > 0 ? String(n) : ""; })()
            : key === "maximumSelection"
              ? (() => { const n = Math.min(Number(String(value ?? "").replace(/[^\d]/g, "")) || 0, 15); return n > 0 ? String(n) : ""; })()
              : key === "availability"
                ? Boolean(value)
                : value;

    setModifierDetailDraft((previous) => {
      if (!previous) return previous;
      const nextDraft = { ...previous, [key]: normalizedValue };

      if (key === "availability") {
        nextDraft.options = previous.options.map((option) => ({
          ...option,
          isAvailable: normalizedValue,
        }));
      }

      modifierDetailDraftRef.current = nextDraft;
      return nextDraft;
    });
    if (key === "name") {
      clearModifierDetailError("name");
    }
    if (key === "minimumSelection" || key === "maximumSelection") {
      const currentDraft = modifierDetailDraftRef.current;
      if (currentDraft) {
        const rangeError = getModifierSelectionRangeError({
          ...currentDraft,
          [key]: normalizedValue,
        });
        setModifierDetailErrors((previous) =>
          rangeError
            ? { ...previous, selectionRange: rangeError }
            : (previous.selectionRange ? { ...previous, selectionRange: undefined } : previous)
        );
      }
    }
  }

  function handleToggleModifierDetailAvailability() {
    if (isLockedSelectedBusinessUnit) return;
    const currentDraft = modifierDetailDraftRef.current;
    if (!currentDraft) return;

    const nextAvailability = currentDraft.availability === false;
    const nextDraft = {
      ...currentDraft,
      availability: nextAvailability,
      options: currentDraft.options.map((option) => ({
        ...option,
        isAvailable: nextAvailability,
      })),
    };

    if (modifierDetailEditingRef.current?.kind === "all") {
      setModifierDetailDraft(nextDraft);
      modifierDetailDraftRef.current = nextDraft;
      return;
    }

    persistModifierDetailDraft(nextDraft, "Modifier updated");
  }

  function handleModifierDetailOptionChange(optionId, key, value) {
    if (isLockedSelectedBusinessUnit) return;
    const currentDraft = modifierDetailDraftRef.current;
    if (!currentDraft) return;

    const nextOptions = currentDraft.options.map((option) =>
      option.id === optionId
        ? (() => {
          if (key === "additionalPrice") {
            return {
              ...option,
              additionalPrice: getNormalizedNominalDigits(value),
            };
          }

          if (key === "isAvailable") {
            return {
              ...option,
              isAvailable: Boolean(value),
            };
          }

          if (key === "selectedIngredient") {
            const ingredientSelection = getModifierIngredientSelection({
              selectedIngredient: String(value ?? ""),
            });
            const hasIngredient = Boolean(
              ingredientSelection.ingredientId ||
              ingredientSelection.selectedIngredient
            );

            return {
              ...option,
              ingredientId: ingredientSelection.ingredientId,
              selectedIngredient: ingredientSelection.selectedIngredient,
              ingredientUnit: ingredientSelection.ingredientUnit,
              ingredientQty: hasIngredient
                ? Number(option.ingredientQty) > 0
                  ? normalizeModifierIngredientQtyInput(option.ingredientQty)
                  : "1"
                : "",
            };
          }

          if (key === "ingredientQty") {
            return {
              ...option,
              ingredientQty: normalizeModifierIngredientQtyInput(value),
            };
          }

          return {
            ...option,
            [key]: String(value ?? ""),
          };
        })()
        : option
    );
    const hasAnyAvailable = nextOptions.some(
      (option) => option.isAvailable !== false
    );

    const nextDraft = {
      ...currentDraft,
      options: nextOptions,
      availability: key === "isAvailable" ? hasAnyAvailable : currentDraft.availability,
    };

    if (modifierDetailEditingRef.current?.kind === "all") {
      setModifierDetailDraft(nextDraft);
      modifierDetailDraftRef.current = nextDraft;
      if (key === "name" && String(value ?? "").trim()) {
        setModifierDetailErrors((previous) =>
          clearModifierOptionErrorId(previous, "optionNames", optionId)
        );
      }

      if (
        (key === "selectedIngredient" && !String(value ?? "").trim()) ||
        (key === "selectedIngredient" &&
          Number(
            nextOptions.find((option) => option.id === optionId)?.ingredientQty ?? 0
          ) > 0) ||
        (key === "ingredientQty" &&
          Number(
            nextOptions.find((option) => option.id === optionId)?.ingredientQty ?? 0
          ) > 0)
      ) {
        setModifierDetailErrors((previous) =>
          clearModifierOptionErrorId(
            previous,
            "optionIngredientQtys",
            optionId
          )
        );
      }
      return;
    }

    persistModifierDetailDraft(nextDraft, "Modifier updated");
  }

  function handleModifierDetailAssignedUnitChange(unitId, key, value) {
    if (isLockedSelectedBusinessUnit) return;
    const currentDraft = modifierDetailDraftRef.current;
    if (!currentDraft) return;

    const nextDraft = {
      ...currentDraft,
      assignedUnits: currentDraft.assignedUnits.map((unit) =>
        unit.id === unitId ? { ...unit, [key]: value } : unit
      ),
    };

    setModifierDetailDraft(nextDraft);
    modifierDetailDraftRef.current = nextDraft;
  }

  function handleAddModifierDetailOption() {
    if (isLockedSelectedBusinessUnit) return;
    const currentDraft = modifierDetailDraftRef.current;
    if (!currentDraft) return;

    const existingEmptyOption = (currentDraft.options ?? []).find(
      (option) => !option.name.trim()
    );
    if (existingEmptyOption) {
      return;
    }

    const nextOption = createEmptyModifierOption();
    const nextDraft = {
      ...currentDraft,
      options: [...(currentDraft.options ?? []), nextOption],
    };

    setModifierDetailDraft(nextDraft);
    modifierDetailDraftRef.current = nextDraft;
  }

  function handleRemoveModifierDetailOption(optionId) {
    if (isLockedSelectedBusinessUnit) return;
    const currentDraft = modifierDetailDraftRef.current;
    if (!currentDraft) return;

    const remainingOptions = (currentDraft.options ?? []).filter(
      (option) => option.id !== optionId
    );
    const nextDraft = {
      ...currentDraft,
      options: normalizeModifierOptions(remainingOptions),
    };

    if (modifierDetailEditingRef.current?.kind === "all") {
      setModifierDetailDraft(nextDraft);
      modifierDetailDraftRef.current = nextDraft;
      setModifierDetailErrors((previous) => {
        let nextErrors = clearModifierOptionErrorId(
          previous,
          "optionNames",
          optionId
        );
        nextErrors = clearModifierOptionErrorId(
          nextErrors,
          "optionIngredientQtys",
          optionId
        );
        return nextErrors;
      });
      return;
    }

    persistModifierDetailDraft(nextDraft, "Modifier updated");
    setModifierDetailEditing((previous) =>
      previous?.kind === "option-row" && previous.optionId === optionId
        ? null
        : previous
    );
    setModifierDetailSnapshot(null);
    modifierDetailEditingRef.current =
      modifierDetailEditingRef.current?.kind === "option-row" &&
        modifierDetailEditingRef.current.optionId === optionId
        ? null
        : modifierDetailEditingRef.current;
    modifierDetailSnapshotRef.current = null;
  }

  function openCategoryDetailPanel(rowId, { skipCreateGuard = false } = {}) {
    if (
      !skipCreateGuard &&
      guardCreatePanelNavigation(() =>
        openCategoryDetailPanel(rowId, { skipCreateGuard: true })
      )
    ) {
      return;
    }

    const currentDraft = categoryDetailDraftRef.current;
    const currentEditing = categoryDetailEditingRef.current;

    if (currentDraft && currentEditing) {
      const result = commitCategoryDetailEdit(
        currentDraft,
        currentEditing,
        "Category updated",
        { showSuccess: false }
      );
      if (!result.ok) return;
    }

    const row = (records.category || []).find((item) => item.id === rowId);
    if (!row) return;

    if (currentPage !== "category") {
      handleSetPage("category", { skipCreateGuard: true });
    }

    const nextDraft = createCategoryDetailDraftFromRecord(row);
    setCategoryDetailId(rowId);
    setCategoryDetailDraft(nextDraft);
    setCategoryDetailEditing(null);
    setCategoryDetailErrors({});
    setCategoryDetailSnapshot(null);
    categoryDetailDraftRef.current = nextDraft;
    categoryDetailEditingRef.current = null;
    categoryDetailSnapshotRef.current = null;
  }

  function closeCategoryDetailPanel() {
    resetCategoryDetailState();
  }

  function openUnitDetailPanel(rowId, { skipCreateGuard = false } = {}) {
    if (
      !skipCreateGuard &&
      guardCreatePanelNavigation(() =>
        openUnitDetailPanel(rowId, { skipCreateGuard: true })
      )
    ) {
      return;
    }

    const currentDraft = unitDetailDraftRef.current;
    const currentEditing = unitDetailEditingRef.current;

    if (currentDraft && currentEditing) {
      const result = commitUnitDetailEdit(currentDraft, currentEditing, "Unit updated", {
        showSuccess: false,
      });
      if (!result.ok) return;
    }

    const row = (records.unit || []).find((item) => item.id === rowId);
    if (!row) return;

    if (currentPage !== "unit") {
      handleSetPage("unit", { skipCreateGuard: true });
    }

    const nextDraft = createUnitDetailDraftFromRecord(row);
    setUnitDetailId(rowId);
    setUnitDetailDraft(nextDraft);
    setUnitDetailEditing(null);
    setUnitDetailErrors({});
    setUnitDetailSnapshot(null);
    unitDetailDraftRef.current = nextDraft;
    unitDetailEditingRef.current = null;
    unitDetailSnapshotRef.current = null;
  }

  function closeUnitDetailPanel() {
    resetUnitDetailState();
  }

  function commitCategoryDetailEdit(
    detailDraft,
    detailEditing,
    message = "Category updated",
    { showSuccess = true } = {}
  ) {
    if (!detailDraft || !detailEditing) {
      return { ok: true, nextDraft: detailDraft };
    }

    const validationMessage = getCategoryDetailValidationMessage(
      detailDraft,
      detailEditing
    );
    if (validationMessage) {
      setCategoryDetailErrors({ name: true });
      return { ok: false, nextDraft: detailDraft };
    }

    const duplicateNameError = getDuplicateCategoryNameError(
      detailDraft.name,
      detailDraft.id
    );
    if (duplicateNameError) {
      setCategoryDetailErrors({ name: duplicateNameError });
      return { ok: false, nextDraft: detailDraft };
    }

    const currentRow = (records.category || []).find((item) => item.id === detailDraft.id);
    const detailContext = getCategoryDetailContext(currentRow, detailDraft);
    if (
      detailDraft.parentCategory !== "None (Main Category)" &&
      !detailContext?.parentOptions.some(
        (option) => option.value === detailDraft.parentCategory
      )
    ) {
      showSnackbar(
        `Category nesting is limited to ${MAX_CATEGORY_NESTING_LEVEL} levels`,
        "red"
      );
      return { ok: false, nextDraft: detailDraft };
    }

    const nextDraft = persistCategoryDetailDraft(
      detailDraft,
      showSuccess ? message : null
    );
    setCategoryDetailEditing(null);
    setCategoryDetailErrors({});
    setCategoryDetailSnapshot(null);
    categoryDetailEditingRef.current = null;
    categoryDetailSnapshotRef.current = null;

    return { ok: true, nextDraft };
  }

  function startCategoryDetailEdit(nextEditing) {
    let nextDraft = categoryDetailDraftRef.current;
    const currentEditing = categoryDetailEditingRef.current;

    if (!nextDraft) return false;
    if (isSameCategoryDetailEditing(currentEditing, nextEditing)) return true;

    if (currentEditing) {
      const result = commitCategoryDetailEdit(
        nextDraft,
        currentEditing,
        "Category updated",
        { showSuccess: false }
      );
      if (!result.ok) return false;
      nextDraft = result.nextDraft;
    }

    const snapshot = cloneCategoryDetailDraftState(nextDraft);
    setCategoryDetailSnapshot(snapshot);
    setCategoryDetailErrors({});
    setCategoryDetailEditing(nextEditing);
    categoryDetailSnapshotRef.current = snapshot;
    categoryDetailEditingRef.current = nextEditing;
    return true;
  }

  function beginCategoryDetailEdit(nextEditing) {
    if (isLockedSelectedBusinessUnit) return;
    startCategoryDetailEdit(nextEditing);
  }

  function cancelCategoryDetailEdit() {
    const isDirty = hasDraftChanges(
      categoryDetailDraftRef.current,
      categoryDetailSnapshotRef.current
    );
    if (isDirty) {
      discardEditActionRef.current = executeCancelCategoryDetailEdit;
      setDiscardEditModalOpen(true);
      return;
    }
    executeCancelCategoryDetailEdit();
  }

  function executeCancelCategoryDetailEdit() {
    if (categoryDetailSnapshotRef.current) {
      setCategoryDetailDraft(categoryDetailSnapshotRef.current);
      categoryDetailDraftRef.current = categoryDetailSnapshotRef.current;
    }
    setCategoryDetailEditing(null);
    setCategoryDetailErrors({});
    setCategoryDetailSnapshot(null);
    categoryDetailEditingRef.current = null;
    categoryDetailSnapshotRef.current = null;
  }

  function saveCategoryDetailEdit(message = "Category updated", options = {}) {
    return commitCategoryDetailEdit(
      categoryDetailDraftRef.current,
      categoryDetailEditingRef.current,
      message,
      options
    ).ok;
  }

  function handleCategoryDetailChange(key, value) {
    const normalizedValue = key === "name" ? String(value ?? "").slice(0, 40) : value;
    setCategoryDetailDraft((previous) => {
      const nextDraft = previous ? { ...previous, [key]: normalizedValue } : previous;
      categoryDetailDraftRef.current = nextDraft;
      return nextDraft;
    });
    if (key === "name") {
      clearCategoryDetailError("name");
    }
  }

  function handleCategoryDetailSingleSelectSave(field, value, message) {
    const currentDraft = categoryDetailDraftRef.current;
    const currentEditing = categoryDetailEditingRef.current;

    if (!currentDraft || !currentEditing) return;

    const nextDraft = { ...currentDraft, [field]: value };
    setCategoryDetailDraft(nextDraft);
    categoryDetailDraftRef.current = nextDraft;
    commitCategoryDetailEdit(nextDraft, currentEditing, message, {
      showSuccess: false,
    });
  }

  function commitUnitDetailEdit(
    detailDraft,
    detailEditing,
    message = "Unit updated",
    { showSuccess = true } = {}
  ) {
    if (!detailDraft || !detailEditing) {
      return { ok: true, nextDraft: detailDraft };
    }

    const validationMessage = getUnitDetailValidationMessage(
      detailDraft,
      detailEditing
    );
    if (validationMessage) {
      setUnitDetailErrors({ name: true });
      return { ok: false, nextDraft: detailDraft };
    }

    const duplicateNameError = getDuplicateUnitNameError(
      detailDraft.name,
      detailDraft.id
    );
    if (duplicateNameError) {
      setUnitDetailErrors({ name: duplicateNameError });
      return { ok: false, nextDraft: detailDraft };
    }

    const nextDraft = persistUnitDetailDraft(
      detailDraft,
      showSuccess ? message : null
    );
    setUnitDetailEditing(null);
    setUnitDetailErrors({});
    setUnitDetailSnapshot(null);
    unitDetailEditingRef.current = null;
    unitDetailSnapshotRef.current = null;

    return { ok: true, nextDraft };
  }

  function startUnitDetailEdit(nextEditing) {
    let nextDraft = unitDetailDraftRef.current;
    const currentEditing = unitDetailEditingRef.current;

    if (!nextDraft) return false;
    if (isSameUnitDetailEditing(currentEditing, nextEditing)) return true;

    if (currentEditing) {
      const result = commitUnitDetailEdit(nextDraft, currentEditing, "Unit updated", {
        showSuccess: false,
      });
      if (!result.ok) return false;
      nextDraft = result.nextDraft;
    }

    const snapshot = cloneUnitDetailDraftState(nextDraft);
    setUnitDetailSnapshot(snapshot);
    setUnitDetailErrors({});
    setUnitDetailEditing(nextEditing);
    unitDetailSnapshotRef.current = snapshot;
    unitDetailEditingRef.current = nextEditing;
    return true;
  }

  function beginUnitDetailEdit(nextEditing) {
    if (isLockedSelectedBusinessUnit) return;
    startUnitDetailEdit(nextEditing);
  }

  function cancelUnitDetailEdit() {
    const isDirty = hasDraftChanges(
      unitDetailDraftRef.current,
      unitDetailSnapshotRef.current
    );
    if (isDirty) {
      discardEditActionRef.current = executeCancelUnitDetailEdit;
      setDiscardEditModalOpen(true);
      return;
    }
    executeCancelUnitDetailEdit();
  }

  function executeCancelUnitDetailEdit() {
    if (unitDetailSnapshotRef.current) {
      setUnitDetailDraft(unitDetailSnapshotRef.current);
      unitDetailDraftRef.current = unitDetailSnapshotRef.current;
    }
    setUnitDetailEditing(null);
    setUnitDetailErrors({});
    setUnitDetailSnapshot(null);
    unitDetailEditingRef.current = null;
    unitDetailSnapshotRef.current = null;
  }

  function saveUnitDetailEdit(message = "Unit updated", options = {}) {
    return commitUnitDetailEdit(
      unitDetailDraftRef.current,
      unitDetailEditingRef.current,
      message,
      options
    ).ok;
  }

  function handleUnitDetailChange(key, value) {
    setUnitDetailDraft((previous) => {
      const nextDraft = previous
        ? {
          ...previous,
          [key]:
            key === "name"
              ? String(value ?? "").slice(0, 40)
              : normalizeUnitPrecisionOption(value),
        }
        : previous;
      unitDetailDraftRef.current = nextDraft;
      return nextDraft;
    });
    if (key === "name") {
      clearUnitDetailError("name");
    }
  }

  function handleUnitDetailSingleSelectSave(field, value, message) {
    const currentDraft = unitDetailDraftRef.current;
    const currentEditing = unitDetailEditingRef.current;

    if (!currentDraft || !currentEditing) return;

    const nextDraft = {
      ...currentDraft,
      [field]:
        field === "precision" ? normalizeUnitPrecisionOption(value) : value,
    };
    setUnitDetailDraft(nextDraft);
    unitDetailDraftRef.current = nextDraft;
    commitUnitDetailEdit(nextDraft, currentEditing, message, {
      showSuccess: false,
    });
  }

  function syncTableCardScrollState(node) {
    if (!(node instanceof HTMLElement)) return;
    const tableCard = node.closest(".table-card");
    const isListPageTableCard = tableCard?.classList.contains(
      "list-page-table-card"
    );
    const isDeviceManagementTableCard =
      tableCard?.dataset.pageId === "device-management";

    if (isListPageTableCard) {
      const stickyCheckboxCell = node.querySelector("thead .lab-table__checkbox");
      const stickyTitleCell = node.querySelector("thead .lab-table__title-column");
      const stickyCheckboxWidth =
        stickyCheckboxCell instanceof HTMLElement
          ? stickyCheckboxCell.getBoundingClientRect().width
          : 0;
      const stickyTitleWidth =
        stickyTitleCell instanceof HTMLElement
          ? stickyTitleCell.getBoundingClientRect().width
          : 0;

      node.style.setProperty(
        "--list-table-sticky-checkbox-width",
        `${stickyCheckboxWidth}px`
      );
      node.style.setProperty(
        "--list-table-sticky-left-width",
        `${stickyCheckboxWidth + stickyTitleWidth}px`
      );
    }

    const footer = tableCard?.querySelector(".table-footer");
    const nodeRect = node.getBoundingClientRect();
    const footerHeight =
      footer instanceof HTMLElement ? footer.getBoundingClientRect().height : 0;
    const cardBottomPadding = 16;
    const viewportBottom = window.innerHeight;
    const requestedMaxHeight = Number(node.dataset.maxHeight || "");
    const resolvedMaxHeight =
      Number.isFinite(requestedMaxHeight) && requestedMaxHeight > 0
        ? requestedMaxHeight
        : Math.max(
          180,
          viewportBottom - nodeRect.top - footerHeight - cardBottomPadding
        );
    const naturalHeight = Math.max(0, node.scrollHeight);
    const isScrollable = naturalHeight > resolvedMaxHeight + 1;

    node.style.maxHeight = `${resolvedMaxHeight}px`;
    node.style.height =
      isScrollable ? `${resolvedMaxHeight}px` : "auto";
    node.style.scrollbarGutter =
      isScrollable && !isDeviceManagementTableCard ? "stable" : "auto";
    node.dataset.scrollable = isScrollable ? "true" : "false";
    node.dataset.scrollTop = node.scrollTop > 1 ? "true" : "false";
    const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
    const scrollLeft = Math.max(0, node.scrollLeft);
    node.dataset.scrollLeft = scrollLeft > 0 ? "true" : "false";
    node.dataset.scrollRight =
      scrollLeft < maxScrollLeft - 1 ? "true" : "false";
    if (tableCard instanceof HTMLElement) {
      tableCard.dataset.scrollable = isScrollable ? "true" : "false";
    }
  }

  function handleTableCardScroll(event) {
    syncTableCardScrollState(event.currentTarget);
  }

  function syncCatalogDetailPanelTableScroll(node) {
    if (!(node instanceof HTMLElement)) return;
    const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
    const scrollLeft = Math.max(0, node.scrollLeft);
    node.dataset.scrollLeft = scrollLeft > 0 ? "true" : "false";
    node.dataset.scrollRight =
      scrollLeft < maxScrollLeft - 1 ? "true" : "false";
  }

  function handleCatalogDetailPanelTableScroll(event) {
    syncCatalogDetailPanelTableScroll(event.currentTarget);
  }

  function commitCatalogDetailEdit(
    detailDraft,
    detailEditing,
    message = "Catalog updated",
    { showSuccess = true } = {}
  ) {
    if (!detailDraft || !detailEditing) {
      return { ok: true, nextDraft: detailDraft };
    }

    setCatalogDetailDraftErrors({});

    const validationMessage = getCatalogDetailValidationMessage(
      detailDraft,
      detailEditing
    );
    if (validationMessage) {
      showSnackbar(validationMessage, "red");
      return { ok: false, nextDraft: detailDraft };
    }

    const nextCatalogErrors = {};

    const catalogNameDuplicateError = getDuplicateCatalogNameError(detailDraft.name?.trim(), detailDraft.id);
    if (catalogNameDuplicateError) {
      nextCatalogErrors.name = catalogNameDuplicateError;
    }

    const additionalNameDetailErrors = {};
    const primaryDetailName = detailDraft.name?.trim() ?? "";
    (detailDraft.additionalNames ?? []).forEach((entry, index) => {
      const trimmed = entry.value.trim();
      if (!trimmed) return;
      const dupError = getDuplicateCatalogNameError(trimmed, detailDraft.id);
      if (dupError) {
        additionalNameDetailErrors[entry.id] = dupError;
        return;
      }
      if (trimmed === primaryDetailName) {
        additionalNameDetailErrors[entry.id] = DUPLICATE_CATALOG_NAME_ERROR_MESSAGE;
        return;
      }
      const isDup = (detailDraft.additionalNames ?? []).some(
        (other, otherIndex) => otherIndex !== index && other.value.trim() === trimmed
      );
      if (isDup) {
        additionalNameDetailErrors[entry.id] = DUPLICATE_CATALOG_NAME_ERROR_MESSAGE;
      }
    });
    if (Object.keys(additionalNameDetailErrors).length) {
      nextCatalogErrors.additionalNames = additionalNameDetailErrors;
    }

    let showDupRecordSnackbar = false;
    if (isDuplicateCatalogRecord(detailDraft, records.catalog)) {
      if (!nextCatalogErrors.name) nextCatalogErrors.name = true;
      nextCatalogErrors.unit = true;
      nextCatalogErrors.category = true;
      showDupRecordSnackbar = true;
    }

    if (
      detailDraft.trackStock &&
      !(detailDraft.ingredients ?? []).some((item) => item.name)
    ) {
      nextCatalogErrors.ingredients = true;
    }

    if (Object.keys(nextCatalogErrors).length) {
      setCatalogDetailDraftErrors(nextCatalogErrors);
      if (showDupRecordSnackbar) showSnackbar(DUPLICATE_CATALOG_SNACKBAR_MESSAGE, "red");
      return { ok: false, nextDraft: detailDraft };
    }

    const nextDraft = persistCatalogDetailDraft(
      detailDraft,
      showSuccess ? message : null
    );
    setCatalogDetailEditing(null);
    setCatalogDetailSnapshot(null);
    catalogDetailEditingRef.current = null;
    catalogDetailSnapshotRef.current = null;

    return { ok: true, nextDraft };
  }

  function startCatalogDetailEdit(nextEditing, { prepareDraft } = {}) {
    let nextDraft = catalogDetailDraftRef.current;
    const currentEditing = catalogDetailEditingRef.current;

    if (!nextDraft) return false;
    if (isSameCatalogDetailEditing(currentEditing, nextEditing)) return true;

    if (currentEditing) {
      const result = commitCatalogDetailEdit(
        nextDraft,
        currentEditing,
        "Catalog updated",
        { showSuccess: false }
      );
      if (!result.ok) return false;
      nextDraft = result.nextDraft;
    }

    if (prepareDraft) {
      nextDraft = prepareDraft(nextDraft);
      setCatalogDetailDraft(nextDraft);
      catalogDetailDraftRef.current = nextDraft;
    }

    const snapshot = cloneCatalogDetailDraftState(nextDraft);
    setCatalogDetailSnapshot(snapshot);
    setCatalogDetailEditing(nextEditing);
    catalogDetailSnapshotRef.current = snapshot;
    catalogDetailEditingRef.current = nextEditing;
    return true;
  }

  function beginCatalogDetailEdit(nextEditing) {
    if (isLockedSelectedBusinessUnit) return;
    startCatalogDetailEdit(nextEditing);
  }

  function beginCatalogDetailAssignmentEdit(unitId) {
    if (isLockedSelectedBusinessUnit) return;
    startCatalogDetailEdit(
      { kind: "assignment-row", unitId },
      {
        prepareDraft: (draft) =>
          getCatalogDetailAssignmentEditingDraft(draft, unitId),
      }
    );
  }

  function cancelCatalogDetailEdit() {
    const isDirty = hasDraftChanges(
      catalogDetailDraftRef.current,
      catalogDetailSnapshotRef.current
    );
    if (isDirty) {
      discardEditActionRef.current = executeCancelCatalogDetailEdit;
      setDiscardEditModalOpen(true);
      return;
    }
    executeCancelCatalogDetailEdit();
  }

  function executeCancelCatalogDetailEdit() {
    if (catalogDetailSnapshotRef.current) {
      setCatalogDetailDraft(catalogDetailSnapshotRef.current);
      catalogDetailDraftRef.current = catalogDetailSnapshotRef.current;
    }
    setCatalogDetailEditing(null);
    setCatalogDetailSnapshot(null);
    catalogDetailEditingRef.current = null;
    catalogDetailSnapshotRef.current = null;
  }

  function saveCatalogDetailEdit(message = "Catalog updated", options = {}) {
    return commitCatalogDetailEdit(
      catalogDetailDraftRef.current,
      catalogDetailEditingRef.current,
      message,
      options
    ).ok;
  }


  function handleCatalogDetailChange(key, value) {
    if (isLockedSelectedBusinessUnit) return;
    const normalizedValue = key === "name" ? String(value ?? "").slice(0, 40) : value;
    setCatalogDetailDraft((previous) => {
      const nextDraft = previous ? { ...previous, [key]: normalizedValue } : previous;
      catalogDetailDraftRef.current = nextDraft;
      return nextDraft;
    });
    setCatalogDetailDraftErrors((prev) => ({ ...prev, [key]: false }));
  }


  function handleCatalogDetailSingleSelectSave(field, value, message) {
    if (isLockedSelectedBusinessUnit) return;
    const currentDraft = catalogDetailDraftRef.current;
    const currentEditing = catalogDetailEditingRef.current;

    if (!currentDraft || !currentEditing) return;

    const nextDraft = { ...currentDraft, [field]: value };
    setCatalogDetailDraft(nextDraft);
    catalogDetailDraftRef.current = nextDraft;
    if (currentEditing.kind === "all") {
      return;
    }
    commitCatalogDetailEdit(nextDraft, currentEditing, message, {
      showSuccess: false,
    });
  }

  function handleCatalogDetailTypeSave(nextType) {
    if (isLockedSelectedBusinessUnit) return;
    const currentDraft = catalogDetailDraftRef.current;
    const currentEditing = catalogDetailEditingRef.current;

    if (!currentDraft || !currentEditing) return;

    const nextDraft = getNextCatalogDetailTypeDraft(currentDraft, nextType);
    setCatalogDetailDraft(nextDraft);
    catalogDetailDraftRef.current = nextDraft;
    if (currentEditing.kind === "all") {
      return;
    }
    commitCatalogDetailEdit(nextDraft, currentEditing, "Catalog type updated", {
      showSuccess: false,
    });
  }

  function handleToggleCatalogDetailAvailability() {
    if (isLockedSelectedBusinessUnit) return;
    if (!catalogDetailDraft) return;

    const nextDraft = {
      ...catalogDetailDraft,
      availability: !catalogDetailDraft.availability,
    };
    if (catalogDetailEditingRef.current?.kind === "all") {
      setCatalogDetailDraft(nextDraft);
      catalogDetailDraftRef.current = nextDraft;
      return;
    }

    persistCatalogDetailDraft(nextDraft, "Catalog updated");
  }

  function handleCatalogDetailPhotoUpload(event) {
    if (isLockedSelectedBusinessUnit) return;
    if (!catalogDetailDraft) return;

    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const remainingSlots = Math.max(0, 5 - catalogDetailDraft.photos.length);
    const acceptedExtensions = new Set(["jpg", "jpeg", "png", "heic"]);
    const nextPhotos = [];
    let validationMessage = "";

    if (!remainingSlots) {
      showSnackbar("Maximum 5 photos allowed", "red");
      event.target.value = "";
      return;
    }

    files.slice(0, remainingSlots).forEach((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!acceptedExtensions.has(extension)) {
        validationMessage = "Only JPG, JPEG, PNG, and HEIC files are allowed";
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        validationMessage = "Each photo must be 3 MB or smaller";
        return;
      }

      nextPhotos.push({
        id: nextCatalogBuilderId("detail-photo"),
        name: file.name,
        url: window.URL.createObjectURL(file),
        isMain: false,
        objectUrl: true,
      });
    });

    if (files.length > remainingSlots && !validationMessage) {
      validationMessage = "Only the first 5 photos can be added";
    }

    if (nextPhotos.length) {
      const mergedPhotos = [...catalogDetailDraft.photos, ...nextPhotos].map(
        (photo, index) => ({
          ...photo,
          isMain: catalogDetailDraft.photos.some((item) => item.isMain)
            ? photo.isMain
            : index === 0,
        })
      );
      const nextDraft = {
        ...catalogDetailDraft,
        photos: mergedPhotos,
      };

      if (catalogDetailEditingRef.current?.kind === "all") {
        setCatalogDetailDraft(nextDraft);
        catalogDetailDraftRef.current = nextDraft;
      } else {
        persistCatalogDetailDraft(nextDraft);
      }
    }

    if (validationMessage) {
      showSnackbar(validationMessage, "red");
    }

    event.target.value = "";
  }

  function handleSetMainCatalogDetailPhoto(photoId) {
    if (isLockedSelectedBusinessUnit) return;
    if (!catalogDetailDraft) return;

    const nextDraft = {
      ...catalogDetailDraft,
      photos: catalogDetailDraft.photos.map((photo) => ({
        ...photo,
        isMain: photo.id === photoId,
      })),
    };

    if (catalogDetailEditingRef.current?.kind === "all") {
      setCatalogDetailDraft(nextDraft);
      catalogDetailDraftRef.current = nextDraft;
      return;
    }

    persistCatalogDetailDraft(nextDraft);
  }

  function handleRemoveCatalogDetailPhoto(photoId) {
    if (isLockedSelectedBusinessUnit) return;
    if (!catalogDetailDraft) return;

    const targetPhoto = catalogDetailDraft.photos.find(
      (photo) => photo.id === photoId
    );
    if (targetPhoto?.objectUrl) {
      window.URL.revokeObjectURL(targetPhoto.url);
    }

    const remainingPhotos = catalogDetailDraft.photos.filter(
      (photo) => photo.id !== photoId
    );
    if (
      remainingPhotos.length &&
      !remainingPhotos.some((photo) => photo.isMain)
    ) {
      remainingPhotos[0] = { ...remainingPhotos[0], isMain: true };
    }

    const nextDraft = {
      ...catalogDetailDraft,
      photos: remainingPhotos,
    };

    if (catalogDetailEditingRef.current?.kind === "all") {
      setCatalogDetailDraft(nextDraft);
      catalogDetailDraftRef.current = nextDraft;
      return;
    }

    persistCatalogDetailDraft(nextDraft);
  }

  function handleCatalogDetailPackageItemChange(itemId, key, value) {
    if (isLockedSelectedBusinessUnit) return;
    const currentDraft = catalogDetailDraftRef.current;
    if (!currentDraft) return;

    const nextDraft = {
      ...currentDraft,
      packageItems: updatePackageItems(
        currentDraft.packageItems,
        itemId,
        key,
        value
      ),
    };
    const isEditingCurrentRow = Boolean(catalogDetailEditingRef.current);

    if (isEditingCurrentRow) {
      setCatalogDetailDraft(nextDraft);
      catalogDetailDraftRef.current = nextDraft;
      return;
    }

    if (key === "catalogId" && value) {
      persistCatalogDetailDraft(nextDraft);
      return;
    }

    setCatalogDetailDraft(nextDraft);
    catalogDetailDraftRef.current = nextDraft;
  }


  function handleCatalogDetailIngredientChange(itemId, key, value) {
    if (isLockedSelectedBusinessUnit) return;
    setCatalogDetailDraft((previous) => {
      if (!previous) return previous;
      const nextIngredients = previous.ingredients.map((item) => {
        if (item.id === itemId) {
          let updated = { ...item, [key]: value };
          if (key === "name" && value) {
            const matched = packageCatalogMap[value];
            if (matched) {
              updated.unit = matched.unit || "Pcs";
              updated.qty = updated.qty || "1";
            }
          }
          return updated;
        }
        return item;
      });

      const lastItem = nextIngredients[nextIngredients.length - 1];
      if (lastItem && (lastItem.name || lastItem.qty)) {
        nextIngredients.push(createEmptyIngredientItem());
      }

      const nextDraft = { ...previous, ingredients: nextIngredients };
      catalogDetailDraftRef.current = nextDraft;
      return nextDraft;
    });
    setCatalogDetailDraftErrors((prev) => ({ ...prev, ingredients: false }));
  }

  function handleRemoveCatalogDetailIngredient(itemId) {
    if (isLockedSelectedBusinessUnit) return;
    setCatalogDetailDraft((previous) => {
      if (!previous) return previous;
      let nextIngredients = previous.ingredients.filter(
        (item) => item.id !== itemId
      );
      if (nextIngredients.length === 0) {
        nextIngredients = [createEmptyIngredientItem()];
      }
      const nextDraft = { ...previous, ingredients: nextIngredients };
      catalogDetailDraftRef.current = nextDraft;
      return nextDraft;
    });
  }

  function handleAddCatalogDetailAdditionalName() {
    if (isLockedSelectedBusinessUnit) return;
    setCatalogDetailDraft((previous) => {
      if (!previous) return previous;
      const nextDraft = {
        ...previous,
        additionalNames: [...(previous.additionalNames ?? []), createEmptyAdditionalName()],
      };
      catalogDetailDraftRef.current = nextDraft;
      return nextDraft;
    });
  }

  function handleCatalogDetailAdditionalNameChange(id, value) {
    if (isLockedSelectedBusinessUnit) return;
    setCatalogDetailDraft((previous) => {
      if (!previous) return previous;
      const nextDraft = {
        ...previous,
        additionalNames: (previous.additionalNames ?? []).map((entry) =>
          entry.id === id ? { ...entry, value } : entry
        ),
      };
      catalogDetailDraftRef.current = nextDraft;
      return nextDraft;
    });
    setCatalogDetailDraftErrors((previous) => {
      if (!previous.additionalNames?.[id]) return previous;
      const { [id]: _, ...remaining } = previous.additionalNames;
      return { ...previous, additionalNames: remaining };
    });
  }

  function handleRemoveCatalogDetailAdditionalName(id) {
    if (isLockedSelectedBusinessUnit) return;
    setCatalogDetailDraft((previous) => {
      if (!previous) return previous;
      const nextDraft = {
        ...previous,
        additionalNames: (previous.additionalNames ?? []).filter(
          (entry) => entry.id !== id
        ),
      };
      catalogDetailDraftRef.current = nextDraft;
      return nextDraft;
    });
    setCatalogDetailDraftErrors((previous) => {
      if (!previous.additionalNames?.[id]) return previous;
      const { [id]: _, ...remaining } = previous.additionalNames;
      return { ...previous, additionalNames: remaining };
    });
  }

  function handleRemoveCatalogDetailPackageItem(itemId) {
    if (isLockedSelectedBusinessUnit) return;
    if (!catalogDetailDraft) return;

    const remainingItems = catalogDetailDraft.packageItems.filter(
      (item) => item.id !== itemId
    );
    const nextDraft = {
      ...catalogDetailDraft,
      packageItems: normalizePackageItems(remainingItems),
    };

    if (catalogDetailEditingRef.current?.kind === "all") {
      setCatalogDetailDraft(nextDraft);
      catalogDetailDraftRef.current = nextDraft;
      return;
    }

    persistCatalogDetailDraft(nextDraft, "Package items updated");
    setCatalogDetailEditing(null);
    setCatalogDetailSnapshot(null);
  }

  function handleCatalogDetailAssignedUnitChange(unitId, key, value) {
    if (isLockedSelectedBusinessUnit) return;
    setCatalogDetailDraft((previous) => {
      if (!previous) return previous;

      const nextDraft = {
        ...previous,
        assignedUnits: previous.assignedUnits.map((unit) =>
          unit.id === unitId
            ? {
              ...unit,
              [key]:
                key === "overridePriceInput"
                  ? value.replace(/[^\d]/g, "")
                  : value,
            }
            : unit
        ),
      };
      catalogDetailDraftRef.current = nextDraft;
      return nextDraft;
    });
  }

  function handleRemoveCatalogDetailAssignedUnit(unitId) {
    if (isLockedSelectedBusinessUnit) return;
    if (!catalogDetailDraft) return;

    const nextDraft = {
      ...catalogDetailDraft,
      assignedUnits: catalogDetailDraft.assignedUnits.filter(
        (unit) => unit.id !== unitId
      ),
    };

    if (catalogDetailEditingRef.current?.kind === "all") {
      setCatalogDetailDraft(nextDraft);
      catalogDetailDraftRef.current = nextDraft;
      return;
    }

    persistCatalogDetailDraft(nextDraft, "Unit assignment updated");
  }

  function clearCatalogDraftError(...keys) {
    setCatalogDraftErrors((previous) => {
      const next = { ...previous };
      let hasChanges = false;

      keys.forEach((key) => {
        if (next[key]) {
          delete next[key];
          hasChanges = true;
        }
      });

      return hasChanges ? next : previous;
    });
  }

  function resetCatalogDraft({ disposePhotos = true } = {}) {
    setCatalogDraft((previous) => {
      if (disposePhotos) {
        disposeCatalogPhotos(previous.photos);
      }
      return createInitialCatalogDraft();
    });
    setCatalogDraftErrors({});
    setIsUnitAssignmentModalOpen(false);
    setAssignedUnitAssignmentIds([]);
    setUnitAssignmentSearch("");
    setSelectedUnitAssignmentIds([]);
  }

  function clearCategoryDraftError(...keys) {
    setCategoryDraftErrors((previous) => {
      const next = { ...previous };
      let hasChanges = false;

      keys.forEach((key) => {
        if (next[key]) {
          delete next[key];
          hasChanges = true;
        }
      });

      return hasChanges ? next : previous;
    });
  }

  function resetCategoryDraft() {
    setCategoryDraft(createInitialCategoryDraft());
    setCategoryDraftErrors({});
  }

  function clearUnitDraftError(...keys) {
    setUnitDraftErrors((previous) => {
      const next = { ...previous };
      let hasChanges = false;

      keys.forEach((key) => {
        if (next[key]) {
          delete next[key];
          hasChanges = true;
        }
      });

      return hasChanges ? next : previous;
    });
  }

  function resetUnitDraft() {
    setUnitDraft(createInitialUnitDraft());
    setUnitDraftErrors({});
  }

  function clearCategoryDetailError(...keys) {
    setCategoryDetailErrors((previous) => {
      const next = { ...previous };
      let hasChanges = false;

      keys.forEach((key) => {
        if (next[key]) {
          delete next[key];
          hasChanges = true;
        }
      });

      return hasChanges ? next : previous;
    });
  }

  function clearUnitDetailError(...keys) {
    setUnitDetailErrors((previous) => {
      const next = { ...previous };
      let hasChanges = false;

      keys.forEach((key) => {
        if (next[key]) {
          delete next[key];
          hasChanges = true;
        }
      });

      return hasChanges ? next : previous;
    });
  }

  function clearModifierDetailError(...keys) {
    setModifierDetailErrors((previous) => {
      const next = { ...previous };
      let hasChanges = false;

      keys.forEach((key) => {
        if (next[key]) {
          delete next[key];
          hasChanges = true;
        }
      });

      return hasChanges ? next : previous;
    });
  }

  function clearPricingRuleDetailError(...keys) {
    setPricingRuleDetailErrors((previous) => {
      const next = { ...previous };
      let hasChanges = false;

      keys.forEach((key) => {
        if (next[key]) {
          delete next[key];
          hasChanges = true;
        }
      });

      return hasChanges ? next : previous;
    });
  }

  function clearDeviceManagementDraftError(...keys) {
    setDeviceManagementDraftErrors((previous) => {
      const next = { ...previous };
      let hasChanges = false;

      keys.forEach((key) => {
        if (next[key]) {
          delete next[key];
          hasChanges = true;
        }
      });

      return hasChanges ? next : previous;
    });
  }

  function resetDeviceManagementDraft() {
    setDeviceManagementDraft(createInitialDeviceManagementDraft());
    setDeviceManagementDraftErrors({});
  }

  function resetGroupedDeviceDraft() {
    setGroupedDeviceDraft(createInitialGroupedDeviceDraft());
    setGroupedDeviceDraftErrors({});
  }

  function clearGroupedDeviceDraftError(...keys) {
    setGroupedDeviceDraftErrors((previous) => {
      const next = { ...previous };
      let hasChanges = false;

      keys.forEach((key) => {
        if (next[key]) {
          delete next[key];
          hasChanges = true;
        }
      });

      return hasChanges ? next : previous;
    });
  }

  function clearGroupedDeviceDetailDraftError(...keys) {
    setGroupedDeviceDetailDraftErrors((previous) => {
      const next = { ...previous };
      let hasChanges = false;

      keys.forEach((key) => {
        if (next[key]) {
          delete next[key];
          hasChanges = true;
        }
      });

      return hasChanges ? next : previous;
    });
  }

  function openCategoryCreatePage() {
    resetCategoryDraft();
    resetCategoryDetailState();
    resetCreatePanelStepValue("category");
    handleSetPage("category-create");
  }

  function openUnitCreatePage() {
    resetUnitDraft();
    resetUnitDetailState();
    resetCreatePanelStepValue("unit");
    handleSetPage("unit-create");
  }

  function openRoleAccessCreatePage() {
    resetRoleAccessDetailState();
    handleSetPage("role-management-create");
    resetRoleAccessDraft();
  }

  function closeRoleAccessCreatePage() {
    handleSetPage("role-management");
  }

  function resetRoleAccessDraft() {
    setRoleAccessDraft(
      createInitialRoleAccessDraft(Boolean(selectedSidebarBusinessUnit))
    );
    setRoleAccessDraftErrors({});
    setRoleAccessCreatePanelTab("general");
  }

  function resetRoleAccessDetailState() {
    setRoleAccessDetailId(null);
    setRoleAccessDetailDraft(null);
    setRoleAccessDetailEditing(null);
    setRoleAccessDetailSnapshot(null);
    setRoleAccessDetailErrors({});
    setRoleAccessDetailPanelTab("general");
  }

  function openRoleAccessDetailPanel(rowId) {
    const row = records["role-access"].find((r) => r.id === rowId);
    if (!row) return;

    const openDetail = (id) => {
      setRoleAccessDetailId(id);
      setRoleAccessDetailDraft(
        createRoleAccessDraftFromRecord(
          row,
          Boolean(selectedSidebarBusinessUnit)
        )
      );
      setRoleAccessDetailEditing(null);
      setRoleAccessDetailErrors({});
      setRoleAccessDetailPanelTab("general");
      pendingRoleAccessDetailIdRef.current = null;
    };

    const openAfterClose = () => {
      handleSetPage("role-access", { skipCreateGuard: true });
      openDetail(rowId);
    };

    if (
      currentPage === "role-access-create" ||
      currentPage === "role-management-create"
    ) {
      pendingRoleAccessDetailIdRef.current = rowId;
      if (!guardCreatePanelNavigation(openAfterClose)) {
        pendingRoleAccessDetailIdRef.current = null;
      }
      return;
    }

    openDetail(rowId);
  }

  function goToRoleAccessCreateRmsTab() {
    const nextErrors = getRoleAccessNameErrors(roleAccessDraft.name);

    if (Object.keys(nextErrors).length) {
      setRoleAccessDraftErrors((previous) => ({ ...previous, ...nextErrors }));
      setRoleAccessCreatePanelTab("general");
      return;
    }

    setRoleAccessDraftErrors((previous) => {
      if (!previous.name) return previous;
      const next = { ...previous };
      delete next.name;
      return next;
    });
    setRoleAccessCreatePanelTab("rms-module");
  }

  function goToRoleAccessDetailRmsTab() {
    const nextErrors = getRoleAccessNameErrors(
      roleAccessDetailDraft?.name,
      roleAccessDetailId
    );

    if (Object.keys(nextErrors).length) {
      setRoleAccessDetailErrors((previous) => ({ ...previous, ...nextErrors }));
      setRoleAccessDetailPanelTab("general");
      return;
    }

    setRoleAccessDetailErrors((previous) => {
      if (!previous.name) return previous;
      const next = { ...previous };
      delete next.name;
      return next;
    });
    setRoleAccessDetailPanelTab("rms-module");
  }

  function saveRoleAccessDraft() {
    const nextErrors = getRoleAccessNameErrors(roleAccessDraft.name);

    const permissionsStructure = getRolePermissionsStructure(
      Boolean(selectedSidebarBusinessUnit)
    );
    const permissionSectionErrors = getRoleAccessPermissionSectionErrors(
      roleAccessDraft,
      permissionsStructure
    );

    if (Object.keys(permissionSectionErrors).length) {
      nextErrors.permissionSections = permissionSectionErrors;
    }

    if (!hasAnyVisibleRoleAccessPermission(roleAccessDraft, permissionsStructure)) {
      nextErrors.permissions =
        "At least one module must have an access level assigned";
    }

    if (Object.keys(nextErrors).length) {
      setRoleAccessDraftErrors(nextErrors);
      setRoleAccessCreatePanelTab(
        getRoleAccessErrorTab(
          nextErrors,
          Boolean(selectedSidebarBusinessUnit)
        )
      );
      if (nextErrors.permissions) {
        showSnackbar(nextErrors.permissions, "red");
      }
      return;
    }

    const normalizedDraft = createRoleAccessDraftFromRecord(
      roleAccessDraft,
      Boolean(selectedSidebarBusinessUnit)
    );

    const newRow = {
      ...normalizedDraft,
      id: `rl-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
      members: "0 members",
      membersList: [],
      updated: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      status: "Active",
    };

    setRecords((prev) => ({
      ...prev,
      "role-access": [newRow, ...prev["role-access"]],
    }));

    // Clear pending navigation to prevent discard modal
    pendingCreateNavigationRef.current = null;
    resetRoleAccessDraft();
    setRoleAccessDraftErrors({});
    showSnackbar("New role access created", "green");
    handleSetPage("role-management", { skipCreateGuard: true });
  }

  function saveRoleAccessDetailEdit() {
    const nextErrors = getRoleAccessNameErrors(
      roleAccessDetailDraft.name,
      roleAccessDetailId
    );

    const permissionsStructure = getRolePermissionsStructure(
      Boolean(selectedSidebarBusinessUnit)
    );
    const permissionSectionErrors = getRoleAccessPermissionSectionErrors(
      roleAccessDetailDraft,
      permissionsStructure
    );

    if (Object.keys(permissionSectionErrors).length) {
      nextErrors.permissionSections = permissionSectionErrors;
    }

    if (
      !hasAnyVisibleRoleAccessPermission(roleAccessDetailDraft, permissionsStructure)
    ) {
      nextErrors.permissions =
        "At least one module must have an access level assigned";
    }

    if (Object.keys(nextErrors).length) {
      setRoleAccessDetailErrors(nextErrors);
      setRoleAccessDetailPanelTab(
        getRoleAccessErrorTab(
          nextErrors,
          Boolean(selectedSidebarBusinessUnit)
        )
      );
      if (nextErrors.permissions) {
        showSnackbar(nextErrors.permissions, "red");
      }
      return;
    }

    const normalizedDraft = createRoleAccessDraftFromRecord(
      roleAccessDetailDraft,
      Boolean(selectedSidebarBusinessUnit)
    );

    setRecords((prev) => ({
      ...prev,
      "role-access": prev["role-access"].map((r) =>
        r.id === roleAccessDetailId
          ? {
            ...normalizedDraft,
            updated: new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          }
          : r
      ),
    }));

    setRoleAccessDetailEditing(null);
    setRoleAccessDetailErrors({});
    showSnackbar("Role access updated", "black");
  }

  function cancelRoleAccessDetailEdit() {
    setRoleAccessDetailEditing(null);
    setRoleAccessDetailErrors({});
    setRoleAccessDetailPanelTab("general");
    const originalRow = records["role-access"].find((r) => r.id === roleAccessDetailId);
    if (originalRow) {
      setRoleAccessDetailDraft(
        createRoleAccessDraftFromRecord(
          originalRow,
          Boolean(selectedSidebarBusinessUnit)
        )
      );
    }
  }

  function handleRoleAccessChange(field, value) {
    const normalizedValue = field === "name" ? String(value ?? "").slice(0, 40) : value;
    if (roleAccessDetailId) {
      setRoleAccessDetailDraft((prev) => ({ ...prev, [field]: normalizedValue }));
      if (field === "name" && String(normalizedValue).trim()) {
        setRoleAccessDetailErrors((prev) => ({ ...prev, name: false }));
      } else if (field === "permissions" || field === "permissionSections") {
        setRoleAccessDetailErrors((prev) => {
          const next = { ...prev };
          delete next.permissions;
          delete next.permissionSections;
          return next;
        });
      }
    } else {
      setRoleAccessDraft((prev) => ({ ...prev, [field]: normalizedValue }));
      if (field === "name" && normalizedValue.trim()) {
        setRoleAccessDraftErrors((prev) => ({ ...prev, name: false }));
      } else if (field === "permissions" || field === "permissionSections") {
        setRoleAccessDraftErrors((prev) => {
          const next = { ...prev };
          delete next.permissions;
          delete next.permissionSections;
          return next;
        });
      }
    }
  }

  function openDeviceManagementCreatePage() {
    resetDeviceManagementDraft();
    setDeviceManagementDetailId(null);
    setDeviceManagementDetailEditing(null);
    setDeviceManagementDetailPanelTab("general");
    handleSetPage("device-management-create");
  }

  function openGroupedDeviceCreatePage() {
    resetGroupedDeviceDraft();
    setGroupedDeviceDetailId(null);
    setGroupedDeviceDetailEditing(null);
    handleSetPage("grouped-device-create");
  }

  function closeGroupedDeviceCreatePage() {
    handleSetPage("grouped-device");
  }

  function openGroupedDeviceDetailPanel(row) {
    setGroupedDeviceDetailId(row.id);
    setGroupedDeviceDetailDraft({ ...row });
    setGroupedDeviceDetailEditing(null);
    if (currentPage !== "grouped-device") {
      handleSetPage("grouped-device");
    }
  }

  function closeCategoryCreatePage() {
    handleSetPage("category");
  }

  function closeUnitCreatePage() {
    handleSetPage("unit");
  }

  function closeDeviceManagementCreatePage() {
    handleSetPage("device-management");
  }

  function handleCategoryDraftChange(key, value) {
    const normalizedValue =
      key === "name" ? String(value ?? "").slice(0, 40) : value;

    setCategoryDraft((previous) => ({ ...previous, [key]: normalizedValue }));
    clearCategoryDraftError(key);
  }

  function handleUnitDraftChange(key, value) {
    const normalizedValue =
      key === "name"
        ? String(value ?? "").slice(0, 40)
        : normalizeUnitPrecisionOption(value);

    setUnitDraft((previous) => ({ ...previous, [key]: normalizedValue }));
    clearUnitDraftError(key);
  }

  function clearSellingTimeDraftError(...keys) {
    setSellingTimeDraftErrors((previous) => {
      const next = { ...previous };
      let hasChanges = false;

      keys.forEach((key) => {
        if (next[key]) {
          delete next[key];
          hasChanges = true;
        }
      });

      return hasChanges ? next : previous;
    });
  }

  function clearSellingTimeDraftErrorsByPrefix(prefix) {
    setSellingTimeDraftErrors((previous) => {
      const next = { ...previous };
      let hasChanges = false;

      Object.keys(next).forEach((key) => {
        if (key.startsWith(prefix)) {
          delete next[key];
          hasChanges = true;
        }
      });

      return hasChanges ? next : previous;
    });
  }

  function resetSellingTimeDraft() {
    setSellingTimeDraft(createInitialSellingTimeDraft());
    setSellingTimeDraftErrors({});
  }

  function openSellingTimeCreatePage() {
    resetSellingTimeDraft();
    resetSellingTimeDetailState();
    resetCreatePanelStepValue("selling-time");
    handleSetPage("selling-time-create");
  }

  function closeSellingTimeCreatePage() {
    handleSetPage("selling-time");
  }

  function handleSellingTimeDraftNameChange(value) {
    setSellingTimeDraft((previous) => ({
      ...previous,
      name: String(value ?? "").slice(0, 30),
    }));
    clearSellingTimeDraftError("name");
  }

  function updateSellingTimeDay(dayId, updater) {
    setSellingTimeDraft((previous) => ({
      ...previous,
      days: previous.days.map((day) => (day.id === dayId ? updater(day) : day)),
    }));
  }

  function handleToggleSellingTimeDay(dayId) {
    updateSellingTimeDay(dayId, (day) => {
      const nextEnabled = !day.enabled;

      return {
        ...day,
        enabled: nextEnabled,
        is24Hours: false,
        slots: [createSellingTimeSlot("", "")],
      };
    });
    clearSellingTimeDraftErrorsByPrefix(getSellingTimeDayErrorPrefix(dayId));
  }

  function handleToggleSellingTimeTwentyFourHours(dayId) {
    updateSellingTimeDay(dayId, (day) => {
      const nextChecked = !day.is24Hours;

      return {
        ...day,
        enabled: true,
        is24Hours: nextChecked,
        slots: nextChecked
          ? [createSellingTimeSlot("00:00", "23:59")]
          : [createSellingTimeSlot("", "")],
      };
    });
    clearSellingTimeDraftErrorsByPrefix(getSellingTimeDayErrorPrefix(dayId));
  }

  function handleSellingTimeSlotChange(dayId, slotId, key, value) {
    updateSellingTimeDay(dayId, (day) => ({
      ...day,
      slots: day.slots.map((slot) =>
        slot.id === slotId
          ? { ...slot, [key]: String(value ?? "").slice(0, 5) }
          : slot
      ),
    }));
    clearSellingTimeDraftError(getSellingTimeSlotErrorKey(dayId, slotId, key));
  }

  function handleAddSellingTimeSlot(dayId) {
    updateSellingTimeDay(dayId, (day) => ({
      ...day,
      enabled: true,
      is24Hours: false,
      slots: [...day.slots, createSellingTimeSlot("", "")],
    }));
  }

  function handleRemoveSellingTimeSlot(dayId, slotId) {
    updateSellingTimeDay(dayId, (day) => {
      const remainingSlots = day.slots.filter((slot) => slot.id !== slotId);

      return {
        ...day,
        is24Hours: false,
        slots: remainingSlots.length
          ? remainingSlots
          : [createSellingTimeSlot("", "")],
      };
    });
    clearSellingTimeDraftError(
      getSellingTimeSlotErrorKey(dayId, slotId, "start"),
      getSellingTimeSlotErrorKey(dayId, slotId, "end")
    );
  }

  function clearSpecialPricingRuleDraftError(...keys) {
    setSpecialPricingRuleDraftErrors((previous) => {
      const next = { ...previous };
      let hasChanges = false;

      keys.forEach((key) => {
        if (next[key]) {
          delete next[key];
          hasChanges = true;
        }
      });

      return hasChanges ? next : previous;
    });
  }

  function resetSpecialPricingRuleDraft() {
    setSpecialPricingRuleDraft(createInitialSpecialPricingRuleDraft());
    setSpecialPricingRuleDraftErrors({});
  }

  function buildPricingRuleDetailRecordForStorage(detailDraft) {
    return createSpecialPricingRuleRecord({
      id: detailDraft.id,
      name: detailDraft.name.trim(),
      startDate: detailDraft.startDate,
      endDate: detailDraft.endDate,
      overrides: normalizeSpecialPricingRuleOverridesForStorage(
        detailDraft.overrides
      ),
      selectedOverrideIds: {
        catalog: [],
        modifier: [],
      },
    });
  }

  function persistPricingRuleDetailDraft(nextDraft, snackbarMessage = null) {
    const currentRecord = records["pricing-rule"].find(
      (item) => item.id === nextDraft.id
    );
    if (!currentRecord) return nextDraft;

    const storedRecord = {
      ...currentRecord,
      ...buildPricingRuleDetailRecordForStorage(nextDraft),
    };

    setRecords((previous) => ({
      ...previous,
      "pricing-rule": previous["pricing-rule"].map((item) =>
        item.id === storedRecord.id ? storedRecord : item
      ),
    }));

    const normalizedDraft =
      createPricingRuleDetailDraftFromRecord(storedRecord);
    setPricingRuleDetailDraft(normalizedDraft);
    pricingRuleDetailDraftRef.current = normalizedDraft;

    if (snackbarMessage) {
      showSnackbar(snackbarMessage, "black");
    }

    return normalizedDraft;
  }

  function resetPricingRuleDetailState() {
    setPricingRuleDetailId(null);
    setPricingRuleDetailPanelTab("general");
    setPricingRuleDetailDraft(null);
    setPricingRuleDetailEditing(null);
    setPricingRuleDetailErrors({});
    setPricingRuleDetailSnapshot(null);
    pricingRuleDetailDraftRef.current = null;
    pricingRuleDetailEditingRef.current = null;
    pricingRuleDetailSnapshotRef.current = null;
  }

  function openPricingRuleDetailPanel(
    rowId,
    { skipCreateGuard = false } = {}
  ) {
    if (
      !skipCreateGuard &&
      guardCreatePanelNavigation(() =>
        openPricingRuleDetailPanel(rowId, { skipCreateGuard: true })
      )
    ) {
      return;
    }

    const currentDraft = pricingRuleDetailDraftRef.current;
    const currentEditing = pricingRuleDetailEditingRef.current;

    if (currentDraft && currentEditing) {
      const result = commitPricingRuleDetailEdit(
        currentDraft,
        currentEditing,
        "Special pricing rule updated",
        { showSuccess: false }
      );
      if (!result.ok) return;
    }

    const row = records["pricing-rule"].find((item) => item.id === rowId);
    if (!row) return;

    if (currentPage !== "pricing-rule") {
      handleSetPage("pricing-rule", { skipCreateGuard: true });
    }

    const nextDraft = createPricingRuleDetailDraftFromRecord(row);
    setPricingRuleTab("special");
    setPricingRuleDetailId(rowId);
    setPricingRuleDetailPanelTab("general");
    setPricingRuleDetailDraft(nextDraft);
    setPricingRuleDetailEditing(null);
    setPricingRuleDetailErrors({});
    setPricingRuleDetailSnapshot(null);
    pricingRuleDetailDraftRef.current = nextDraft;
    pricingRuleDetailEditingRef.current = null;
    pricingRuleDetailSnapshotRef.current = null;
  }

  function closePricingRuleDetailPanel() {
    resetPricingRuleDetailState();
  }

  function openPricingRuleCreatePage() {
    resetSpecialPricingRuleDraft();
    resetPricingRuleDetailState();
    setPricingOverrideEditing(null);
    setPricingRuleTab("special");
    resetCreatePanelStepValue("pricing-rule");
    handleSetPage("pricing-rule-create");
  }

  function closePricingRuleCreatePage() {
    handleSetPage("pricing-rule");
  }

  function handleSpecialPricingRuleDraftChange(key, value) {
    const normalizedValue =
      key === "name" ? String(value ?? "").slice(0, 80) : value;

    setSpecialPricingRuleDraft((previous) => ({
      ...previous,
      [key]: normalizedValue,
    }));
    clearSpecialPricingRuleDraftError(key);
  }

  function handleToggleAllSpecialPricingRuleOverrides(sectionKey) {
    setSpecialPricingRuleDraft((previous) => {
      const groups = previous.overrides[sectionKey] ?? [];
      const itemIds = groups.flatMap((group) =>
        group.items.map((item) => item.id)
      );
      const hasAll =
        itemIds.length > 0 &&
        itemIds.every((id) => previous.selected[sectionKey].includes(id));

      return {
        ...previous,
        selected: {
          ...previous.selected,
          [sectionKey]: hasAll ? [] : itemIds,
        },
      };
    });
  }

  function handleToggleSpecialPricingRuleGroup(sectionKey, group) {
    setSpecialPricingRuleDraft((previous) => {
      const itemIds = group.items.map((item) => item.id);
      const nextSelected = new Set(previous.selected[sectionKey]);
      const hasAll = itemIds.every((id) => nextSelected.has(id));

      itemIds.forEach((id) => {
        if (hasAll) {
          nextSelected.delete(id);
        } else {
          nextSelected.add(id);
        }
      });

      return {
        ...previous,
        selected: {
          ...previous.selected,
          [sectionKey]: Array.from(nextSelected),
        },
      };
    });
  }

  function handleToggleSpecialPricingRuleItem(sectionKey, itemId) {
    setSpecialPricingRuleDraft((previous) => {
      const nextSelected = new Set(previous.selected[sectionKey]);
      if (nextSelected.has(itemId)) {
        nextSelected.delete(itemId);
      } else {
        nextSelected.add(itemId);
      }

      return {
        ...previous,
        selected: {
          ...previous.selected,
          [sectionKey]: Array.from(nextSelected),
        },
      };
    });
  }

  function handleSpecialPricingRuleMaximumChange(sectionKey, itemId, value) {
    const normalizedValue = normalizePricingOverrideEditInput(value);

    setSpecialPricingRuleDraft((previous) => ({
      ...previous,
      overrides: {
        ...previous.overrides,
        [sectionKey]: previous.overrides[sectionKey].map((group) => ({
          ...group,
          items: group.items.map((item) =>
            item.id === itemId
              ? { ...item, maximum: normalizedValue || "0" }
              : item
          ),
        })),
      },
    }));
  }

  function clearModifierDraftError(...keys) {
    setModifierDraftErrors((previous) => {
      const next = { ...previous };
      let hasChanges = false;

      keys.forEach((key) => {
        if (next[key]) {
          delete next[key];
          hasChanges = true;
        }
      });

      return hasChanges ? next : previous;
    });
  }

  function resetModifierDraft() {
    setModifierDraft(createInitialModifierDraft());
    setModifierDraftErrors({});
    setModifierDragOverOptionId(null);
    modifierDraggedOptionIdRef.current = null;
  }

  function openModifierCreatePage() {
    resetModifierDraft();
    resetModifierDetailState();
    resetCreatePanelStepValue("modifier");
    handleSetPage("modifier-create");
  }

  function closeModifierCreatePage() {
    handleSetPage("modifier");
  }

  function handleModifierDraftChange(key, value) {
    const normalizedValue =
      key === "name"
        ? String(value ?? "").slice(0, 40)
        : key === "connectedCatalog"
          ? Array.isArray(value)
            ? value
            : []
          : key === "minimumSelection"
            ? (() => { const n = Math.min(Number(String(value ?? "").replace(/[^\d]/g, "")) || 0, 15); return n > 0 ? String(n) : ""; })()
            : key === "maximumSelection"
              ? (() => { const n = Math.min(Number(String(value ?? "").replace(/[^\d]/g, "")) || 0, 15); return n > 0 ? String(n) : ""; })()
              : key === "availability"
                ? Boolean(value)
                : value;

    setModifierDraft((previous) => {
      const nextDraft = {
        ...previous,
        [key]: normalizedValue,
      };

      if (key === "availability") {
        nextDraft.options = previous.options.map((option) => ({
          ...option,
          isAvailable: normalizedValue,
        }));
      }

      return nextDraft;
    });

    clearModifierDraftError(key);
    if (key === "minimumSelection" || key === "maximumSelection") {
      const rangeError = getModifierSelectionRangeError({
        ...modifierDraft,
        [key]: normalizedValue,
      });
      setModifierDraftErrors((previous) =>
        rangeError
          ? { ...previous, selectionRange: rangeError }
          : (previous.selectionRange ? { ...previous, selectionRange: undefined } : previous)
      );
    }
  }

  function handleModifierOptionChange(optionId, key, value) {
    setModifierDraft((previous) => {
      const nextOptions = previous.options.map((option) =>
        option.id === optionId
          ? (() => {
            if (key === "additionalPrice") {
              return {
                ...option,
                additionalPrice: getNormalizedNominalDigits(value),
              };
            }

            if (key === "isAvailable") {
              return {
                ...option,
                isAvailable: Boolean(value),
              };
            }

            if (key === "selectedIngredient") {
              const ingredientSelection = getModifierIngredientSelection({
                selectedIngredient: String(value ?? ""),
              });
              const hasIngredient = Boolean(
                ingredientSelection.ingredientId ||
                ingredientSelection.selectedIngredient
              );

              return {
                ...option,
                ingredientId: ingredientSelection.ingredientId,
                selectedIngredient: ingredientSelection.selectedIngredient,
                ingredientUnit: ingredientSelection.ingredientUnit,
                ingredientQty: hasIngredient
                  ? Number(option.ingredientQty) > 0
                    ? normalizeModifierIngredientQtyInput(option.ingredientQty)
                    : "1"
                  : "",
              };
            }

            if (key === "ingredientQty") {
              return {
                ...option,
                ingredientQty: normalizeModifierIngredientQtyInput(value),
              };
            }

            return {
              ...option,
              [key]: String(value ?? ""),
            };
          })()
          : option
      );

      return {
        ...previous,
        options: nextOptions,
        availability:
          key === "isAvailable" && Boolean(value) === true
            ? true
            : previous.availability,
      };
    });

    if (key === "name" && String(value ?? "").trim()) {
      setModifierDraftErrors((previous) => {
        return clearModifierOptionErrorId(previous, "optionNames", optionId);
      });
    }

    if (
      (key === "selectedIngredient" && !String(value ?? "").trim()) ||
      (key === "selectedIngredient" && String(value ?? "").trim()) ||
      (key === "ingredientQty" &&
        Number(normalizeModifierIngredientQtyInput(value)) > 0)
    ) {
      setModifierDraftErrors((previous) => {
        return clearModifierOptionErrorId(
          previous,
          "optionIngredientQtys",
          optionId
        );
      });
    }
  }

  function handleAddModifierOption() {
    setModifierDraft((previous) => ({
      ...previous,
      options: [...previous.options, createEmptyModifierOption()],
    }));
  }

  function handleRemoveModifierOption(optionId) {
    setModifierDraft((previous) => {
      const remainingOptions = previous.options.filter(
        (option) => option.id !== optionId
      );

      return {
        ...previous,
        options: normalizeModifierOptions(remainingOptions),
      };
    });

    setModifierDraftErrors((previous) => {
      let nextErrors = clearModifierOptionErrorId(
        previous,
        "optionNames",
        optionId
      );
      nextErrors = clearModifierOptionErrorId(
        nextErrors,
        "optionIngredientQtys",
        optionId
      );
      return nextErrors;
    });
  }

  function handleRemoveModifierAssignedUnit(unitId) {
    setModifierDraft((previous) => ({
      ...previous,
      assignedUnits: previous.assignedUnits.filter(
        (unit) => unit.id !== unitId
      ),
    }));
  }

  function handleModifierOptionDragStart(optionId, event) {
    modifierDraggedOptionIdRef.current = optionId;
    setModifierDragOverOptionId(optionId);
    if (event?.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", optionId);
    }
  }

  function handleModifierOptionDragOver(optionId) {
    if (!modifierDraggedOptionIdRef.current) return;
    if (modifierDragOverOptionId !== optionId) {
      setModifierDragOverOptionId(optionId);
    }
  }

  function handleModifierOptionDrop(targetOptionId) {
    const draggedOptionId = modifierDraggedOptionIdRef.current;
    modifierDraggedOptionIdRef.current = null;
    setModifierDragOverOptionId(null);

    if (!draggedOptionId || draggedOptionId === targetOptionId) return;

    setModifierDraft((previous) => {
      const nextOptions = [...previous.options];
      const draggedIndex = nextOptions.findIndex(
        (option) => option.id === draggedOptionId
      );
      const targetIndex = nextOptions.findIndex(
        (option) => option.id === targetOptionId
      );

      if (draggedIndex === -1 || targetIndex === -1) return previous;

      const [draggedOption] = nextOptions.splice(draggedIndex, 1);
      nextOptions.splice(targetIndex, 0, draggedOption);

      return {
        ...previous,
        options: nextOptions,
      };
    });
  }

  function handleModifierOptionDragEnd() {
    modifierDraggedOptionIdRef.current = null;
    setModifierDragOverOptionId(null);
  }

  function handleModifierDetailOptionDragStart(optionId) {
    modifierDraggedOptionIdRef.current = optionId;
    setModifierDragOverOptionId(optionId);
  }

  function handleModifierDetailOptionDragOver(targetOptionId) {
    if (!modifierDraggedOptionIdRef.current) return;
    if (modifierDragOverOptionId !== targetOptionId) {
      setModifierDragOverOptionId(targetOptionId);
    }
  }

  function handleModifierDetailOptionDrop(targetOptionId) {
    if (!modifierDraggedOptionIdRef.current) return;
    if (modifierDraggedOptionIdRef.current === targetOptionId) {
      modifierDraggedOptionIdRef.current = null;
      setModifierDragOverOptionId(null);
      return;
    }

    const draggedOptionId = modifierDraggedOptionIdRef.current;
    modifierDraggedOptionIdRef.current = null;
    setModifierDragOverOptionId(null);

    setModifierDetailDraft((previous) => {
      if (!previous) return previous;

      const options = [...previous.options];
      const draggedIndex = options.findIndex((opt) => opt.id === draggedOptionId);
      const targetIndex = options.findIndex((opt) => opt.id === targetOptionId);

      if (draggedIndex === -1 || targetIndex === -1) return previous;

      const [draggedOption] = options.splice(draggedIndex, 1);
      options.splice(targetIndex, 0, draggedOption);

      const nextDraft = { ...previous, options };
      modifierDetailDraftRef.current = nextDraft;
      return nextDraft;
    });
  }

  function handleModifierDetailOptionDragEnd() {
    modifierDraggedOptionIdRef.current = null;
    setModifierDragOverOptionId(null);
  }

  function handleSaveCategoryDraft() {
    const nextErrors = {};
    const trimmedName = categoryDraft.name.trim();

    if (!trimmedName) {
      nextErrors.name = true;
    }

    const duplicateNameError = getDuplicateCategoryNameError(trimmedName);
    if (duplicateNameError) {
      nextErrors.name = duplicateNameError;
    }

    if (Object.keys(nextErrors).length) {
      setCategoryDraftErrors(nextErrors);
      return;
    }

    if (
      categoryDraft.parentCategory !== "None (Main Category)" &&
      !categoryParentOptions.some(
        (option) => option.value === categoryDraft.parentCategory
      )
    ) {
      showSnackbar(
        `Category nesting is limited to ${MAX_CATEGORY_NESTING_LEVEL} levels`,
        "red"
      );
      return;
    }

    const newRecord = {
      id: nextCatalogBuilderId("category"),
      name: trimmedName,
      parentCategory:
        categoryDraft.parentCategory === "None (Main Category)"
          ? ""
          : categoryDraft.parentCategory,
      sellingTime: categoryDraft.sellingTime,
    };

    setRecords((previous) => ({
      ...previous,
      category: [newRecord, ...previous.category],
    }));

    resetCategoryDraft();
    finalizeCreateSuccess("category", "category", "New category created");
  }

  function handleSaveUnitDraft() {
    const nextErrors = {};
    const trimmedName = unitDraft.name.trim();

    if (!trimmedName) {
      nextErrors.name = true;
    }

    const duplicateNameError = getDuplicateUnitNameError(trimmedName);
    if (duplicateNameError) {
      nextErrors.name = duplicateNameError;
    }

    if (Object.keys(nextErrors).length) {
      setUnitDraftErrors(nextErrors);
      return;
    }

    setRecords((previous) => ({
      ...previous,
      unit: [
        {
          id: nextCatalogBuilderId("unit"),
          name: trimmedName,
          precision: normalizeUnitPrecisionOption(unitDraft.precision),
        },
        ...previous.unit,
      ],
    }));

    resetUnitDraft();
    finalizeCreateSuccess("unit", "unit", "New unit created");
  }

  function handleSaveSellingTimeDraft() {
    const nextErrors = {};
    const trimmedName = sellingTimeDraft.name.trim();

    if (!trimmedName) {
      nextErrors.name = true;
    }

    sellingTimeDraft.days.forEach((day) => {
      if (!day.enabled || day.is24Hours) return;

      day.slots.forEach((slot) => {
        if (!slot.start) {
          nextErrors[getSellingTimeSlotErrorKey(day.id, slot.id, "start")] =
            true;
        }
        if (!slot.end) {
          nextErrors[getSellingTimeSlotErrorKey(day.id, slot.id, "end")] = true;
        }
      });
    });

    if (Object.keys(nextErrors).length) {
      setSellingTimeDraftErrors(nextErrors);
      return;
    }

    const normalizedSchedule = sellingTimeDraft.days.map((day) => ({
      id: day.id,
      label: day.label,
      enabled: day.enabled,
      is24Hours: day.is24Hours,
      slots: day.enabled
        ? day.is24Hours
          ? [{ start: "00:00", end: "23:59" }]
          : day.slots.map((slot) => ({
            start: slot.start || "",
            end: slot.end || "",
          }))
        : [],
    }));
    const activeDays = normalizedSchedule
      .filter((day) => day.enabled)
      .map((day) => day.label);

    setRecords((previous) => ({
      ...previous,
      "selling-time": [
        {
          id: nextCatalogBuilderId("selling-time"),
          name: trimmedName,
          days: activeDays,
          schedule: normalizedSchedule,
        },
        ...previous["selling-time"],
      ],
    }));

    resetSellingTimeDraft();
    finalizeCreateSuccess(
      "selling-time",
      "selling-time",
      "New selling time created"
    );
  }

  function handleSaveSpecialPricingRuleDraft() {
    const nextErrors = {};
    const trimmedName = specialPricingRuleDraft.name.trim();

    if (!trimmedName) {
      nextErrors.name = true;
    }

    if (!specialPricingRuleDraft.startDate.trim()) {
      nextErrors.startDate = true;
    }

    if (!specialPricingRuleDraft.endDate.trim()) {
      nextErrors.endDate = true;
    }

    const duplicateNameError = getDuplicatePricingRuleNameError(trimmedName);
    if (duplicateNameError) {
      nextErrors.name = duplicateNameError;
    }

    if (Object.keys(nextErrors).length) {
      setSpecialPricingRuleDraftErrors(nextErrors);
      return;
    }

    const normalizedOverrides = normalizeSpecialPricingRuleOverridesForStorage(
      specialPricingRuleDraft.overrides
    );
    const newRecord = createSpecialPricingRuleRecord({
      id: nextCatalogBuilderId("pricing-rule"),
      name: trimmedName,
      startDate: specialPricingRuleDraft.startDate,
      endDate: specialPricingRuleDraft.endDate,
      overrides: normalizedOverrides,
      selectedOverrideIds: {
        catalog: [...specialPricingRuleDraft.selected.catalog],
        modifier: [...specialPricingRuleDraft.selected.modifier],
      },
    });

    setRecords((previous) => ({
      ...previous,
      "pricing-rule": [newRecord, ...previous["pricing-rule"]],
    }));

    resetSpecialPricingRuleDraft();
    setPricingRuleTab("special");
    finalizeCreateSuccess(
      "pricing-rule",
      "pricing-rule",
      "New special pricing rule created"
    );
  }

  function getSellingTimeCreateStepErrors(stepIndex) {
    const nextErrors = {};

    if (stepIndex === 0 && !sellingTimeDraft.name.trim()) {
      nextErrors.name = true;
    }

    return nextErrors;
  }

  function handleSellingTimeCreateStepSelect(currentStep, targetStep) {
    if (targetStep <= currentStep) {
      setCreatePanelStepValue("selling-time", targetStep);
      return;
    }

    for (let stepIndex = currentStep; stepIndex < targetStep; stepIndex += 1) {
      const nextErrors = getSellingTimeCreateStepErrors(stepIndex);
      if (Object.keys(nextErrors).length) {
        setSellingTimeDraftErrors(nextErrors);
        return;
      }
    }

    setCreatePanelStepValue("selling-time", targetStep);
  }

  function getSpecialPricingRuleCreateStepErrors(stepIndex) {
    const nextErrors = {};

    if (stepIndex !== 0) {
      return nextErrors;
    }

    if (!specialPricingRuleDraft.name.trim()) {
      nextErrors.name = true;
    }

    const duplicateNameError = getDuplicatePricingRuleNameError(
      specialPricingRuleDraft.name
    );
    if (duplicateNameError) {
      nextErrors.name = duplicateNameError;
    }

    if (!specialPricingRuleDraft.startDate.trim()) {
      nextErrors.startDate = true;
    }

    if (!specialPricingRuleDraft.endDate.trim()) {
      nextErrors.endDate = true;
    }

    return nextErrors;
  }

  function handleSpecialPricingRuleCreateStepSelect(currentStep, targetStep) {
    if (targetStep <= currentStep) {
      setCreatePanelStepValue("pricing-rule", targetStep);
      return;
    }

    for (let stepIndex = currentStep; stepIndex < targetStep; stepIndex += 1) {
      const nextErrors = getSpecialPricingRuleCreateStepErrors(stepIndex);
      if (Object.keys(nextErrors).length) {
        setSpecialPricingRuleDraftErrors(nextErrors);
        return;
      }
    }

    setCreatePanelStepValue("pricing-rule", targetStep);
  }

  function handleSaveModifierDraft() {
    const nextErrors = {};
    const trimmedName = modifierDraft.name.trim();
    const namedOptions = modifierDraft.options.filter((option) =>
      option.name.trim()
    );
    const optionErrors = getModifierOptionErrors(modifierDraft.options);

    if (!trimmedName) {
      nextErrors.name = true;
    }

    const duplicateNameError = getDuplicateModifierNameError(trimmedName);
    if (duplicateNameError) {
      nextErrors.name = duplicateNameError;
    }

    Object.assign(nextErrors, optionErrors);

    const selectionCountError = getModifierSelectionCountError(modifierDraft);
    if (selectionCountError) {
      nextErrors.selectionCount = selectionCountError;
    }

    if (Object.keys(nextErrors).length) {
      setModifierDraftErrors(nextErrors);
      return;
    }

    const optionCount = namedOptions.length;
    const connectedCatalogCount = modifierDraft.connectedCatalog.length;
    const newRecord = {
      id: nextCatalogBuilderId("modifier"),
      name: trimmedName,
      modifierOptions: `${optionCount} option${optionCount === 1 ? "" : "s"}`,
      connectedCatalog: connectedCatalogCount
        ? `${connectedCatalogCount} catalog`
        : "-",
      connectedCatalogItems: [...modifierDraft.connectedCatalog],
      minimumSelection: modifierDraft.minimumSelection || "0",
      maximumSelection: modifierDraft.maximumSelection || "0",
      allowOverridePrice: Boolean(modifierDraft.allowOverridePrice),
      availability: modifierDraft.availability !== false,
      assignedUnits: cloneAssignedUnits(modifierDraft.assignedUnits),
      options: namedOptions.map((option) =>
        buildModifierOptionRecordForStorage(option)
      ),
    };

    setRecords((previous) => ({
      ...previous,
      modifier: [newRecord, ...previous.modifier],
    }));

    resetModifierDraft();
    finalizeCreateSuccess("modifier", "modifier", "New modifier created");
  }

  function getModifierCreateStepErrors(stepIndex) {
    const nextErrors = {};

    if (stepIndex === 0) {
      if (!modifierDraft.name.trim()) {
        nextErrors.name = true;
      }

      const duplicateNameError = getDuplicateModifierNameError(
        modifierDraft.name
      );
      if (duplicateNameError) {
        nextErrors.name = duplicateNameError;
      }
    }

    if (stepIndex === 1) {
      Object.assign(nextErrors, getModifierOptionErrors(modifierDraft.options));
    }

    return nextErrors;
  }

  function handleModifierCreateStepSelect(currentStep, targetStep) {
    if (targetStep <= currentStep) {
      setCreatePanelStepValue("modifier", targetStep);
      return;
    }

    for (let stepIndex = currentStep; stepIndex < targetStep; stepIndex += 1) {
      const nextErrors = getModifierCreateStepErrors(stepIndex);
      if (Object.keys(nextErrors).length) {
        setModifierDraftErrors(nextErrors);
        return;
      }
    }

    setCreatePanelStepValue("modifier", targetStep);
  }

  function openCatalogCreatePage() {
    resetCatalogDraft();
    resetCatalogDetailState();
    resetCreatePanelStepValue("catalog");
    handleSetPage("catalog-create");
  }

  function closeCatalogCreatePage() {
    handleSetPage("catalog");
  }

  function handleCatalogDraftChange(key, value) {
    const normalizedValue =
      key === "name" ? String(value ?? "").slice(0, 40) : value;
    setCatalogDraft((previous) => ({ ...previous, [key]: normalizedValue }));
    clearCatalogDraftError(key);
  }

  function handleCatalogTypeChange(nextType) {
    const nextPackageItems = (previousPackageItems) =>
      previousPackageItems.length
        ? normalizePackageItems(previousPackageItems)
        : [createEmptyPackageItem()];

    setCatalogDraft((previous) => ({
      ...previous,
      type: nextType,
      unit: nextType === "single" ? previous.unit : "",
      modifier: nextType === "single" ? previous.modifier : [],
      packageItems:
        nextType === "package"
          ? nextPackageItems(previous.packageItems)
          : previous.packageItems,
    }));
    clearCatalogDraftError("packageItems");
  }

  function handleCatalogPhotoUpload(event) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const remainingSlots = Math.max(0, 5 - catalogDraft.photos.length);
    const acceptedExtensions = new Set(["jpg", "jpeg", "png", "heic"]);
    const nextPhotos = [];
    let validationMessage = "";

    if (!remainingSlots) {
      showSnackbar("Maximum 5 photos allowed", "red");
      event.target.value = "";
      return;
    }

    files.slice(0, remainingSlots).forEach((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!acceptedExtensions.has(extension)) {
        validationMessage = "Only JPG, JPEG, PNG, and HEIC files are allowed";
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        validationMessage = "Each photo must be 3 MB or smaller";
        return;
      }

      nextPhotos.push({
        id: nextCatalogBuilderId("photo"),
        name: file.name,
        url: window.URL.createObjectURL(file),
        isMain: false,
        objectUrl: true,
      });
    });

    if (files.length > remainingSlots && !validationMessage) {
      validationMessage = "Only the first 5 photos can be added";
    }

    if (nextPhotos.length) {
      setCatalogDraft((previous) => {
        const mergedPhotos = [...previous.photos, ...nextPhotos].map(
          (photo, index) => ({
            ...photo,
            isMain: previous.photos.some((item) => item.isMain)
              ? photo.isMain
              : index === 0,
          })
        );
        return { ...previous, photos: mergedPhotos };
      });
    }

    if (validationMessage) {
      showSnackbar(validationMessage, "red");
    }

    event.target.value = "";
  }

  function handleRemoveCatalogPhoto(photoId) {
    setCatalogDraft((previous) => {
      const targetPhoto = previous.photos.find((photo) => photo.id === photoId);
      if (targetPhoto?.objectUrl) {
        window.URL.revokeObjectURL(targetPhoto.url);
      }

      const remainingPhotos = previous.photos.filter(
        (photo) => photo.id !== photoId
      );
      if (
        remainingPhotos.length &&
        !remainingPhotos.some((photo) => photo.isMain)
      ) {
        remainingPhotos[0] = { ...remainingPhotos[0], isMain: true };
      }

      return { ...previous, photos: remainingPhotos };
    });
  }

  function handleSetMainCatalogPhoto(photoId) {
    setCatalogDraft((previous) => ({
      ...previous,
      photos: previous.photos.map((photo) => ({
        ...photo,
        isMain: photo.id === photoId,
      })),
    }));
  }

  function handlePackageItemChange(itemId, key, value) {
    setCatalogDraft((previous) => {
      return {
        ...previous,
        packageItems: updatePackageItems(
          previous.packageItems,
          itemId,
          key,
          value
        ),
      };
    });

    if (key === "catalogId" && value) {
      clearCatalogDraftError("packageItems", "price");
    }

    if (key === "qty") {
      clearCatalogDraftError("price");
    }
  }

  function handleRemovePackageItem(itemId) {
    setCatalogDraft((previous) => {
      const remainingItems = previous.packageItems.filter(
        (item) => item.id !== itemId
      );
      return {
        ...previous,
        packageItems: normalizePackageItems(remainingItems),
      };
    });
    clearCatalogDraftError("packageItems", "price");
  }

  function handleIngredientChange(itemId, key, value) {
    setCatalogDraft((previous) => {
      const nextIngredients = previous.ingredients.map((item) => {
        if (item.id === itemId) {
          let updated = { ...item, [key]: value };
          if (key === "name" && value) {
            const matched = packageCatalogMap[value];
            if (matched) {
              updated.unit = matched.unit || "Pcs";
              updated.qty = updated.qty || "1";
            }
          }
          return updated;
        }
        return item;
      });

      const lastItem = nextIngredients[nextIngredients.length - 1];
      if (lastItem.name || lastItem.qty) {
        nextIngredients.push(createEmptyIngredientItem());
      }

      return { ...previous, ingredients: nextIngredients };
    });
  }

  function handleRemoveIngredient(itemId) {
    setCatalogDraft((previous) => {
      let nextIngredients = previous.ingredients.filter(
        (item) => item.id !== itemId
      );
      if (nextIngredients.length === 0) {
        nextIngredients = [createEmptyIngredientItem()];
      }
      return { ...previous, ingredients: nextIngredients };
    });
  }

  function handleAddAdditionalName() {
    setCatalogDraft((previous) => ({
      ...previous,
      additionalNames: [...(previous.additionalNames ?? []), createEmptyAdditionalName()],
    }));
  }

  function handleAdditionalNameChange(id, value) {
    setCatalogDraft((previous) => ({
      ...previous,
      additionalNames: (previous.additionalNames ?? []).map((entry) =>
        entry.id === id ? { ...entry, value } : entry
      ),
    }));
    setCatalogDraftErrors((previous) => {
      if (!previous.additionalNames?.[id]) return previous;
      const { [id]: _, ...remaining } = previous.additionalNames;
      return { ...previous, additionalNames: remaining };
    });
  }

  function handleRemoveAdditionalName(id) {
    setCatalogDraft((previous) => ({
      ...previous,
      additionalNames: (previous.additionalNames ?? []).filter(
        (entry) => entry.id !== id
      ),
    }));
    setCatalogDraftErrors((previous) => {
      if (!previous.additionalNames?.[id]) return previous;
      const { [id]: _, ...remaining } = previous.additionalNames;
      return { ...previous, additionalNames: remaining };
    });
  }

  function openUnitAssignmentModal(target = "create") {
    if (isLockedSelectedBusinessUnit) return;
    const sourceDraft =
      target === "detail"
        ? catalogDetailDraft
        : target === "modifier-detail"
          ? modifierDetailDraftRef.current
          : target === "modifier-create"
            ? modifierDraft
            : catalogDraft;
    if (!sourceDraft) return;

    const existingAssignedIds = (sourceDraft.assignedUnits ?? []).map(
      (unit) => unit.id
    );
    setUnitAssignmentTarget(target);
    setAssignedUnitAssignmentIds(existingAssignedIds);
    setSelectedUnitAssignmentIds([]);
    setUnitAssignmentSearch("");
    setIsUnitAssignmentModalOpen(true);
  }

  function closeUnitAssignmentModal() {
    setIsUnitAssignmentModalOpen(false);
    setAssignedUnitAssignmentIds([]);
    setSelectedUnitAssignmentIds([]);
    setUnitAssignmentSearch("");
    setUnitAssignmentTarget("create");
  }

  function openModifierCatalogModal(target, initialValue = []) {
    setModifierCatalogModalTarget(target);
    setModifierCatalogModalValue(initialValue);
    setIsModifierCatalogModalOpen(true);
  }

  function closeModifierCatalogModal() {
    setIsModifierCatalogModalOpen(false);
    setModifierCatalogModalTarget(null);
    setModifierCatalogModalValue([]);
  }

  function confirmModifierCatalogModal() {
    if (!modifierCatalogModalTarget) return;

    if (modifierCatalogModalTarget === "modifier-create") {
      handleModifierDraftChange("connectedCatalog", modifierCatalogModalValue);
    } else if (modifierCatalogModalTarget === "modifier-detail") {
      handleModifierDetailChange("connectedCatalog", modifierCatalogModalValue);
    } else if (modifierCatalogModalTarget === "grouped-device-create") {
      setGroupedDeviceDraft((prev) => ({
        ...prev,
        catalogList: modifierCatalogModalValue,
      }));
    } else if (modifierCatalogModalTarget === "grouped-device-detail") {
      setGroupedDeviceDetailDraft((prev) => ({
        ...prev,
        catalogList: modifierCatalogModalValue,
      }));
    }

    closeModifierCatalogModal();
  }

  function handleToggleUnitAssignment(unitId) {
    setSelectedUnitAssignmentIds((previous) =>
      previous.includes(unitId)
        ? previous.filter((id) => id !== unitId)
        : [...previous, unitId]
    );
  }

  function handleToggleUnitAssignmentGroup(groupId) {
    const group = BUSINESS_UNIT_ASSIGNMENT_GROUPS.find(
      (item) => item.id === groupId
    );
    if (!group) return;

    const assignedSet = new Set(assignedUnitAssignmentIds);
    const groupUnitIds = group.units
      .map((unit) => unit.id)
      .filter((unitId) => !assignedSet.has(unitId));
    setSelectedUnitAssignmentIds((previous) => {
      const hasAll = groupUnitIds.every((unitId) => previous.includes(unitId));
      if (hasAll) {
        return previous.filter((unitId) => !groupUnitIds.includes(unitId));
      }

      const next = new Set(previous);
      groupUnitIds.forEach((unitId) => next.add(unitId));
      return Array.from(next);
    });
  }

  function handleAssignAllUnits() {
    const assignedSet = new Set(assignedUnitAssignmentIds);
    const allUnitIds = BUSINESS_UNIT_ASSIGNMENT_GROUPS.flatMap((group) =>
      group.units
        .map((unit) => unit.id)
        .filter((unitId) => !assignedSet.has(unitId))
    );
    setSelectedUnitAssignmentIds(allUnitIds);
  }

  function handleConfirmUnitAssignment() {
    const sectionKey =
      unitAssignmentTarget === "modifier-detail" ||
        unitAssignmentTarget === "modifier-create"
        ? "modifier"
        : "catalog";
    const nextAssignedUnits = syncAssignedUnitsWithPricingOverrides(
      createAssignedUnitsFromIds([
        ...assignedUnitAssignmentIds,
        ...selectedUnitAssignmentIds,
      ]),
      sectionKey
    );

    if (unitAssignmentTarget === "detail") {
      if (catalogDetailDraft) {
        const nextDraft = {
          ...catalogDetailDraft,
          assignedUnits: nextAssignedUnits,
        };

        if (catalogDetailEditingRef.current?.kind === "all") {
          setCatalogDetailDraft(nextDraft);
          catalogDetailDraftRef.current = nextDraft;
        } else {
          persistCatalogDetailDraft(nextDraft, "Unit assignment updated");
        }
      }
    } else if (unitAssignmentTarget === "modifier-detail") {
      if (modifierDetailDraftRef.current) {
        const nextDraft = {
          ...modifierDetailDraftRef.current,
          assignedUnits: nextAssignedUnits,
        };

        if (modifierDetailEditingRef.current?.kind === "all") {
          setModifierDetailDraft(nextDraft);
          modifierDetailDraftRef.current = nextDraft;
        } else {
          persistModifierDetailDraft(nextDraft, "Unit assignment updated");
        }
      }
    } else if (unitAssignmentTarget === "modifier-create") {
      setModifierDraft((previous) => ({
        ...previous,
        assignedUnits: nextAssignedUnits,
      }));
    } else {
      setCatalogDraft((previous) => ({
        ...previous,
        assignedUnits: nextAssignedUnits,
      }));
    }

    closeUnitAssignmentModal();
  }

  function handleRemoveAssignedUnit(unitId) {
    setCatalogDraft((previous) => ({
      ...previous,
      assignedUnits: previous.assignedUnits.filter(
        (unit) => unit.id !== unitId
      ),
    }));
  }

  function getCatalogCreateStepErrors(stepIndex) {
    const nextErrors = {};

    if (stepIndex !== 0) {
      return nextErrors;
    }

    if (!catalogDraft.name.trim()) {
      nextErrors.name = true;
    }

    if (!catalogDraft.category) {
      nextErrors.category = true;
    }

    const enteredPrice = Number(catalogDraft.price.replace(/[^\d]/g, "") || 0);
    const hasResolvedPrice =
      enteredPrice > 0 ||
      (catalogDraft.type === "package" && packageTotal > 0);

    if (!hasResolvedPrice) {
      nextErrors.price = true;
    }

    if (
      catalogDraft.type === "package" &&
      !catalogDraft.packageItems.some((item) => item.catalogId)
    ) {
      nextErrors.packageItems = true;
    }

    if (catalogDraft.trackStock && (catalogDraft.ingredients ?? []).length === 0) {
      nextErrors.ingredients = true;
    }

    return nextErrors;
  }

  function handleCatalogCreateNextStep(currentStep) {
    const nextErrors = getCatalogCreateStepErrors(currentStep);

    if (Object.keys(nextErrors).length) {
      setCatalogDraftErrors(nextErrors);
      return;
    }

    setCreatePanelStepValue("catalog", currentStep + 1);
  }

  function handleCatalogCreateStepSelect(currentStep, targetStep) {
    if (targetStep <= currentStep) {
      setCreatePanelStepValue("catalog", targetStep);
      return;
    }

    for (let stepIndex = currentStep; stepIndex < targetStep; stepIndex += 1) {
      const nextErrors = getCatalogCreateStepErrors(stepIndex);
      if (Object.keys(nextErrors).length) {
        setCatalogDraftErrors(nextErrors);
        return;
      }
    }

    setCreatePanelStepValue("catalog", targetStep);
  }

  function getAdditionalNameDuplicateErrors() {
    const errors = {};
    const primaryName = catalogDraft.name.trim();

    catalogDraft.additionalNames.forEach((entry, index) => {
      const trimmed = entry.value.trim();
      if (!trimmed) return;

      const duplicateError = getDuplicateCatalogNameError(trimmed);
      if (duplicateError) {
        errors[entry.id] = duplicateError;
        return;
      }

      if (trimmed === primaryName) {
        errors[entry.id] = DUPLICATE_CATALOG_NAME_ERROR_MESSAGE;
        return;
      }

      const isDuplicateOfOther = catalogDraft.additionalNames.some(
        (other, otherIndex) =>
          otherIndex !== index && other.value.trim() === trimmed
      );
      if (isDuplicateOfOther) {
        errors[entry.id] = DUPLICATE_CATALOG_NAME_ERROR_MESSAGE;
      }
    });

    return errors;
  }

  function handleSaveCatalogDraft() {
    const nextErrors = getCatalogCreateStepErrors(0);

    const catalogNameDuplicateError = getDuplicateCatalogNameError(catalogDraft.name.trim());
    if (catalogNameDuplicateError) {
      nextErrors.name = catalogNameDuplicateError;
    }

    const additionalNameErrors = getAdditionalNameDuplicateErrors();
    if (Object.keys(additionalNameErrors).length) {
      nextErrors.additionalNames = additionalNameErrors;
    }

    if (Object.keys(nextErrors).length) {
      setCatalogDraftErrors(nextErrors);
      return;
    }

    if (isDuplicateCatalogRecord(catalogDraft, records.catalog)) {
      setCatalogDraftErrors((previous) => ({
        ...previous,
        name: true,
        unit: true,
        category: true,
      }));
      showSnackbar(DUPLICATE_CATALOG_SNACKBAR_MESSAGE, "red");
      return;
    }

    const fallbackPrice = catalogDraft.type === "package" ? packageTotal : 0;
    const enteredPrice = Number(catalogDraft.price.replace(/[^\d]/g, "") || 0);
    const basePrice = enteredPrice > 0 ? enteredPrice : fallbackPrice;
    const newRecord = buildCatalogRecordForStorage({
      id: nextCatalogBuilderId("catalog"),
      ...catalogDraft,
      assignedUnits: syncedCatalogDraftAssignedUnits,
      basePrice,
    });
    const nextDetailDraft = createCatalogDetailDraftFromRecord(newRecord);

    setRecords((previous) => ({
      ...previous,
      catalog: [newRecord, ...previous.catalog],
    }));

    pendingCreateNavigationRef.current = null;
    setDiscardCreateModalOpen(false);
    setCatalogDetailDraft(nextDetailDraft);
    setCatalogDetailPanelTab("general");
    setCatalogDetailEditing(null);
    setCatalogDetailSnapshot(null);
    catalogDetailDraftRef.current = nextDetailDraft;
    catalogDetailEditingRef.current = null;
    catalogDetailSnapshotRef.current = null;
    resetCatalogDraft({ disposePhotos: false });
    resetCreatePanelStepValue("catalog");
    showSnackbar("New catalog created", "green");
    handleSetPage("catalog", { skipCreateGuard: true });
  }

  function renderModifierCreatePage() {
    const modifierAssignmentColumns = getModifierUnitAssignmentColumns(
      modifierDraft.options
    );
    const modifierAssignmentRows = buildCatalogAssignedUnitRows(
      modifierDraft.assignedUnits
    );
    const modifierAssignmentColSpan = modifierAssignmentColumns.length + 3;

    return (
      <section className="page-canvas page-canvas--detail">
        <div className="page-body page-body--catalog-create">
          <div className="modifier-create-layout">
            <div className="catalog-create-column catalog-create-column--left">
              <section className="modifier-create-card">
                <div className="modifier-create-card__header">
                  <div
                    className="modifier-create-card__accent"
                    aria-hidden="true"
                  />
                  <p className="modifier-create-card__title type-title-2">
                    General Information
                  </p>
                </div>
                <div className="modifier-create-card__body">
                  <div className="modifier-create-row--stacked">
                    <ModifierCreateNameField
                      value={modifierDraft.name}
                      onChange={(value) =>
                        handleModifierDraftChange("name", value)
                      }
                      error={modifierDraftErrors.name}
                    />
                  </div>
                  <div className="modifier-create-row">
                    <ModifierCreateNumberField
                      label="Minimum Selection"
                      value={modifierDraft.minimumSelection}
                      onChange={(value) =>
                        handleModifierDraftChange("minimumSelection", value)
                      }
                      helper="If > 0, required"
                    />
                    <ModifierCreateNumberField
                      label="Maximum Selection"
                      value={modifierDraft.maximumSelection}
                      onChange={(value) =>
                        handleModifierDraftChange("maximumSelection", value)
                      }
                      helper="Limit Selection"
                    />
                  </div>
                  {modifierDraftErrors.selectionRange && (
                    <p className="modifier-option-table__field-error type-body" style={{ gridColumn: "1 / -1", width: "100%", marginTop: "4px" }}>
                      {modifierDraftErrors.selectionRange}
                    </p>
                  )}
                  <div className="catalog-toggle-field">
                    <span className="catalog-detail-field__label type-body">
                      Allow Override Price
                    </span>
                    <div className="catalog-toggle-field__control">
                      <Toggle
                        checked={modifierDraft.allowOverridePrice}
                        onChange={() =>
                          handleModifierDraftChange(
                            "allowOverridePrice",
                            !modifierDraft.allowOverridePrice
                          )
                        }
                        ariaLabel="Allow override price"
                      />
                    </div>
                  </div>
                </div>
              </section>
              <section className="catalog-create-availability-card">
                <div className="catalog-availability-row">
                  <div className="catalog-availability-row__copy">
                    <p className="type-title-3">Modifier Availability</p>
                    <p className="type-body text-secondary">
                      Turn on to make this modifier available
                    </p>
                  </div>
                  <Toggle
                    checked={modifierDraft.availability}
                    onChange={() =>
                      handleModifierDraftChange(
                        "availability",
                        !modifierDraft.availability
                      )
                    }
                    ariaLabel="Modifier availability"
                  />
                </div>
              </section>
            </div>

            <div className="catalog-create-column catalog-create-column--right">
              <ModifierOptionsTable
                options={modifierDraft.options}
                isEditing={true}
                minimumSelection={modifierDraft.minimumSelection}
                dragOverOptionId={modifierDragOverOptionId}
                optionNameErrors={modifierDraftErrors.optionNames ?? []}
                optionIngredientQtyErrors={
                  modifierDraftErrors.optionIngredientQtys ?? []
                }
                ingredientOptions={MODIFIER_INGREDIENT_OPTION_LABELS}
                onOptionChange={handleModifierOptionChange}
                onRemoveOption={handleRemoveModifierOption}
                onAddOption={handleAddModifierOption}
                onDragStart={handleModifierOptionDragStart}
                onDragEnd={handleModifierOptionDragEnd}
                onDragOver={handleModifierOptionDragOver}
                onDrop={handleModifierOptionDrop}
              />
              {modifierDraftErrors.selectionCount && (
                <p className="modifier-option-table__field-error type-body" style={{ marginTop: "4px" }}>
                  {modifierDraftErrors.selectionCount}
                </p>
              )}

              <section className="modifier-create-card">
                <div className="modifier-create-card__header">
                  <div
                    className="modifier-create-card__accent"
                    aria-hidden="true"
                  />
                  <p className="modifier-create-card__title type-title-2">
                    Connect to Catalog
                  </p>
                </div>
                <div className="modifier-create-card__body">
                  <ModifierCatalogSelectField
                    label="Connect to Catalog"
                    value={modifierDraft.connectedCatalog}
                    groups={modifierCatalogGroups}
                    onChange={(value) =>
                      handleModifierDraftChange("connectedCatalog", value)
                    }
                    placeholder="Select Catalog"
                  />
                </div>
              </section>

              <section className="modifier-unit-assignment">
                <div className="modifier-unit-assignment__header">
                  <p className="modifier-unit-assignment__title type-title-2">
                    Entity Assignment
                  </p>
                  {modifierDraft.assignedUnits.length ? (
                    <LabButton
                      label="Assign"
                      variant="primary"
                      size="small"
                      icon="add"
                      onClick={() => openUnitAssignmentModal("modifier-create")}
                    />
                  ) : null}
                </div>
                <div className="modifier-unit-assignment__body">
                  <div className="catalog-assignment-section">
                    {modifierDraft.assignedUnits.length ? (
                      <>
                        <div className="catalog-assignment-info">
                          <Icon
                            name="infoBlue"
                            className="lab-icon lab-icon--18"
                            alt=""
                          />
                          <p className="type-body">
                            Price override settings for each entity are
                            managed in Pricing Rule menu
                          </p>
                        </div>
                        <div className="modifier-unit-assignment-table-wrap table-scroll">
                          <table className="catalog-assignment-table modifier-unit-assignment-table">
                            <thead>
                              <tr>
                                <th className="modifier-unit-assignment-table__business">
                                  <p className="type-title-3">Entity</p>
                                </th>
                                <th className="modifier-unit-assignment-table__max">
                                  <p className="type-title-3">
                                    Max Override Price
                                  </p>
                                </th>
                                {modifierAssignmentColumns.map((column) => (
                                  <th
                                    key={column.id}
                                    className="modifier-unit-assignment-table__modifier"
                                  >
                                    <p className="type-title-3">
                                      {column.name}
                                    </p>
                                  </th>
                                ))}
                                <th className="modifier-unit-assignment-table__action" />
                              </tr>
                            </thead>
                            <tbody>
                              {modifierAssignmentRows.map((row) =>
                                row.type === "group" ? (
                                  <tr
                                    key={row.id}
                                    className="modifier-unit-assignment-table__group-row"
                                  >
                                    <td colSpan={modifierAssignmentColSpan}>
                                      <p className="type-subtitle-2">
                                        {row.label}
                                      </p>
                                    </td>
                                  </tr>
                                ) : (
                                  <tr key={row.id}>
                                    <td className="modifier-unit-assignment-table__business">
                                      <div className="lab-table__cell-stack">
                                        <p className="type-subtitle-2">
                                          {row.name}
                                        </p>
                                        {row.subtitle ? (
                                          <p className="lab-table__cell-subtitle type-body text-secondary">
                                            {row.subtitle}
                                          </p>
                                        ) : null}
                                      </div>
                                    </td>
                                    <td className="modifier-unit-assignment-table__max">
                                      <p className="type-subtitle-2">
                                        {row.maxOverridePrice}
                                      </p>
                                    </td>
                                    {modifierAssignmentColumns.map((column) => (
                                      <td
                                        key={`${row.id}-${column.id}`}
                                        className="modifier-unit-assignment-table__modifier"
                                      >
                                        <p className="type-subtitle-2">
                                          {getModifierUnitAssignmentValue(
                                            column,
                                            row
                                          )}
                                        </p>
                                      </td>
                                    ))}
                                    <td className="modifier-unit-assignment-table__action">
                                      <button
                                        type="button"
                                        className="catalog-assignment-remove"
                                        aria-label={`Remove ${row.name}`}
                                        onClick={() =>
                                          handleRemoveModifierAssignedUnit(
                                            row.id
                                          )
                                        }
                                      />
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : (
                      <div className="catalog-assignment-empty">
                        <p className="catalog-assignment-empty__title type-title-2">
                          Not Assigned Yet
                        </p>
                        <p className="catalog-assignment-empty__copy type-body">
                          Assign this modifier to an entity so it can be
                          used
                        </p>
                        <LabButton
                          label="Assign"
                          variant="primary"
                          size="small"
                          icon="add"
                          onClick={() =>
                            openUnitAssignmentModal("modifier-create")
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
        <div className="detail-action-bar">
          <button
            type="button"
            className="detail-action-bar__cancel type-title-3"
            onClick={closeModifierCreatePage}
          >
            Cancel Add
          </button>
          <LabButton
            label="Save"
            variant="primary"
            size="medium"
            onClick={handleSaveModifierDraft}
          />
        </div>
      </section>
    );
  }

  function renderCategoryCreatePage() {
    return (
      <section className="page-canvas page-canvas--detail">
        <div className="page-body page-body--catalog-create">
          <div className="category-create-layout">
            <section className="catalog-create-form-card">
              <DetailSection title="General Information">
                <div className="category-create-row">
                  <DetailField
                    label="Category Name"
                    required
                    value={categoryDraft.name}
                    placeholder="Enter Category Name"
                    onChange={(value) =>
                      handleCategoryDraftChange("name", value)
                    }
                    error={categoryDraftErrors.name}
                    maxLength={40}
                  />
                  <DetailSelectField
                    label="Parent Category"
                    required
                    value={categoryDraft.parentCategory}
                    options={categoryParentOptions}
                    onChange={(value) =>
                      handleCategoryDraftChange("parentCategory", value)
                    }
                    placeholder="None (Main Category)"
                    ellipsis
                  />
                  <CategoryColorPicker
                    value={categoryDraft.color}
                    onChange={(value) => handleCategoryDraftChange("color", value)}
                  />
                </div>
              </DetailSection>
            </section>
          </div>
        </div>
        <div className="detail-action-bar">
          <button
            type="button"
            className="detail-action-bar__cancel type-title-3"
            onClick={closeCategoryCreatePage}
          >
            Cancel Add
          </button>
          <LabButton
            label="Save"
            variant="primary"
            size="medium"
            onClick={handleSaveCategoryDraft}
          />
        </div>
      </section>
    );
  }

  function renderSellingTimeCreatePage() {
    return (
      <section className="page-canvas page-canvas--detail">
        <div className="page-body page-body--catalog-create">
          <div className="selling-time-create-layout">
            <div className="selling-time-create-sidebar">
              <section className="selling-time-create-card selling-time-create-card--sidebar">
                <SellingTimeNameField
                  value={sellingTimeDraft.name}
                  onChange={handleSellingTimeDraftNameChange}
                  error={sellingTimeDraftErrors.name}
                />
                <div className="selling-time-create-info">
                  <Icon
                    name="infoBlue"
                    className="lab-icon lab-icon--16"
                    alt=""
                  />
                  <p className="type-body">
                    Your catalog and categories can be linked to selling times
                    you created
                  </p>
                </div>
              </section>
            </div>

            <section className="selling-time-schedule-card">
              <div className="selling-time-schedule-scroll">
                <table className="selling-time-schedule-table">
                  <colgroup>
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>
                        <div className="selling-time-schedule-table__header-copy selling-time-schedule-table__header-copy--day">
                          <p className="type-title-3">Day</p>
                        </div>
                      </th>
                      <th>
                        <div className="selling-time-schedule-table__header-copy">
                          <p className="type-title-3">24 Hours</p>
                        </div>
                      </th>
                      <th>
                        <div className="selling-time-schedule-table__header-copy">
                          <p className="type-title-3">Start Receiving Time</p>
                        </div>
                      </th>
                      <th>
                        <div className="selling-time-schedule-table__header-copy">
                          <p className="type-title-3">End Receiving Time</p>
                        </div>
                      </th>
                      <th>
                        <div className="selling-time-schedule-table__header-copy" />
                      </th>
                      <th>
                        <div className="selling-time-schedule-table__header-copy" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellingTimeDraft.days.map((day) => {
                      const visibleSlots = day.enabled
                        ? day.slots
                        : [{ id: `${day.id}-empty`, start: "", end: "" }];

                      return visibleSlots.map((slot, index) => {
                        const isFirstRow = index === 0;
                        const isLastRow = index === visibleSlots.length - 1;
                        const rowSpan = visibleSlots.length;

                        return (
                          <tr key={slot.id}>
                            {isFirstRow ? (
                              <td
                                rowSpan={rowSpan}
                                className={
                                  day.enabled
                                    ? "selling-time-schedule-table__day-cell"
                                    : "selling-time-schedule-table__day-empty"
                                }
                              >
                                <div className="selling-time-schedule-table__day-stack">
                                  <Toggle
                                    checked={day.enabled}
                                    onChange={() =>
                                      handleToggleSellingTimeDay(day.id)
                                    }
                                    ariaLabel={`${day.label} availability`}
                                  />
                                  <p className="selling-time-schedule-table__day-label type-subtitle-2">
                                    {day.label}
                                  </p>
                                </div>
                              </td>
                            ) : null}

                            {isFirstRow ? (
                              day.enabled ? (
                                <td
                                  rowSpan={rowSpan}
                                  className="selling-time-schedule-table__twenty-four-cell"
                                >
                                  <label className="selling-time-schedule-table__twenty-four">
                                    <LabCheckbox
                                      checked={day.is24Hours}
                                      onChange={() =>
                                        handleToggleSellingTimeTwentyFourHours(
                                          day.id
                                        )
                                      }
                                      ariaLabel={`Set ${day.label} to 24 hours`}
                                    />
                                    <p className="type-subtitle-2">Yes</p>
                                  </label>
                                </td>
                              ) : (
                                <td
                                  rowSpan={rowSpan}
                                  className="selling-time-schedule-table__blank"
                                />
                              )
                            ) : null}

                            {day.enabled ? (
                              <>
                                <td className="selling-time-schedule-table__field-cell">
                                  <SellingTimeTimeField
                                    value={slot.start}
                                    disabled={day.is24Hours}
                                    error={Boolean(
                                      sellingTimeDraftErrors[
                                      getSellingTimeSlotErrorKey(
                                        day.id,
                                        slot.id,
                                        "start"
                                      )
                                      ]
                                    )}
                                    onChange={(value) =>
                                      handleSellingTimeSlotChange(
                                        day.id,
                                        slot.id,
                                        "start",
                                        value
                                      )
                                    }
                                  />
                                </td>
                                <td className="selling-time-schedule-table__field-cell">
                                  <SellingTimeTimeField
                                    value={slot.end}
                                    disabled={day.is24Hours}
                                    error={Boolean(
                                      sellingTimeDraftErrors[
                                      getSellingTimeSlotErrorKey(
                                        day.id,
                                        slot.id,
                                        "end"
                                      )
                                      ]
                                    )}
                                    onChange={(value) =>
                                      handleSellingTimeSlotChange(
                                        day.id,
                                        slot.id,
                                        "end",
                                        value
                                      )
                                    }
                                  />
                                </td>
                                <td className="selling-time-schedule-table__action-cell">
                                  {isLastRow && !day.is24Hours ? (
                                    <button
                                      type="button"
                                      className="selling-time-schedule-table__add-button type-subtitle-2"
                                      onClick={() =>
                                        handleAddSellingTimeSlot(day.id)
                                      }
                                    >
                                      Add Time
                                    </button>
                                  ) : null}
                                </td>
                                <td className="selling-time-schedule-table__delete-cell">
                                  <button
                                    type="button"
                                    className="selling-time-schedule-table__delete"
                                    onClick={() =>
                                      handleRemoveSellingTimeSlot(
                                        day.id,
                                        slot.id
                                      )
                                    }
                                    aria-label={`Remove ${day.label} time`}
                                  >
                                    <Icon
                                      name="delete"
                                      className="lab-icon lab-icon--16"
                                      alt=""
                                    />
                                  </button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="selling-time-schedule-table__blank selling-time-schedule-table__empty-slot" />
                                <td className="selling-time-schedule-table__blank selling-time-schedule-table__empty-slot" />
                                <td className="selling-time-schedule-table__blank selling-time-schedule-table__empty-slot" />
                                <td className="selling-time-schedule-table__blank selling-time-schedule-table__empty-slot" />
                              </>
                            )}
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
        <div className="detail-action-bar">
          <button
            type="button"
            className="detail-action-bar__cancel type-title-3"
            onClick={closeSellingTimeCreatePage}
          >
            Cancel Add
          </button>
          <LabButton
            label="Save"
            variant="primary"
            size="medium"
            onClick={handleSaveSellingTimeDraft}
          />
        </div>
      </section>
    );
  }

  function renderPricingRuleCreatePage() {
    const catalogGroups = specialPricingRuleDraft.overrides.catalog;
    const modifierGroups = specialPricingRuleDraft.overrides.modifier;

    return (
      <section className="page-canvas page-canvas--detail">
        <div className="page-body page-body--catalog-create">
          <div className="pricing-rule-create-layout">
            <section className="catalog-create-form-card">
              <DetailSection title="General Information">
                <div className="catalog-detail-field-grid">
                  <DetailField
                    label="Rule Name"
                    required
                    value={specialPricingRuleDraft.name}
                    placeholder="Enter Rule Name"
                    onChange={(value) =>
                      handleSpecialPricingRuleDraftChange("name", value)
                    }
                    error={specialPricingRuleDraftErrors.name}
                  />
                  <PricingRuleDateField
                    label="Start Date"
                    value={specialPricingRuleDraft.startDate}
                    onChange={(value) =>
                      handleSpecialPricingRuleDraftChange("startDate", value)
                    }
                    placeholder="Select Start Date"
                    error={specialPricingRuleDraftErrors.startDate}
                  />
                  <PricingRuleDateField
                    label="End Date"
                    value={specialPricingRuleDraft.endDate}
                    onChange={(value) =>
                      handleSpecialPricingRuleDraftChange("endDate", value)
                    }
                    placeholder="Select End Date"
                    error={specialPricingRuleDraftErrors.endDate}
                  />
                </div>
              </DetailSection>
            </section>

            <div className="pricing-rule-create-grid">
              <SpecialPricingRuleOverrideCard
                title="Catalog Override Rules"
                groups={catalogGroups}
                selectedIds={specialPricingRuleDraft.selected.catalog}
                onToggleAll={() =>
                  handleToggleAllSpecialPricingRuleOverrides("catalog")
                }
                onToggleGroup={(group) =>
                  handleToggleSpecialPricingRuleGroup("catalog", group)
                }
                onToggleItem={(itemId) =>
                  handleToggleSpecialPricingRuleItem("catalog", itemId)
                }
                onChangeMaximum={(itemId, value) =>
                  handleSpecialPricingRuleMaximumChange(
                    "catalog",
                    itemId,
                    value
                  )
                }
              />
              <SpecialPricingRuleOverrideCard
                title="Modifier Override Rules"
                groups={modifierGroups}
                selectedIds={specialPricingRuleDraft.selected.modifier}
                onToggleAll={() =>
                  handleToggleAllSpecialPricingRuleOverrides("modifier")
                }
                onToggleGroup={(group) =>
                  handleToggleSpecialPricingRuleGroup("modifier", group)
                }
                onToggleItem={(itemId) =>
                  handleToggleSpecialPricingRuleItem("modifier", itemId)
                }
                onChangeMaximum={(itemId, value) =>
                  handleSpecialPricingRuleMaximumChange(
                    "modifier",
                    itemId,
                    value
                  )
                }
              />
            </div>
          </div>
        </div>
        <div className="detail-action-bar">
          <button
            type="button"
            className="detail-action-bar__cancel type-title-3"
            onClick={closePricingRuleCreatePage}
          >
            Cancel Add
          </button>
          <LabButton
            label="Save"
            variant="primary"
            size="medium"
            onClick={handleSaveSpecialPricingRuleDraft}
          />
        </div>
      </section>
    );
  }

  function renderCatalogCreatePage() {
    const packageRows = catalogDraft.packageItems;
    const createPackageCatalogMap = packageCatalogMap;
    const showAssignmentOverridePrice = catalogDraft.allowOverridePrice;
    const assignmentGroupColSpan = showAssignmentOverridePrice ? 4 : 3;
    const getAvailableCreatePackageOptions = (rowId, currentCatalogId = "") => {
      const selectedOptions = new Set(
        packageRows
          .filter((row) => row.id !== rowId && row.catalogId)
          .map((row) => row.catalogId)
      );

      return packageCatalogOptions.filter(
        (option) => option === currentCatalogId || !selectedOptions.has(option)
      );
    };

    const assignmentRows = buildCatalogAssignedUnitRows(
      syncedCatalogDraftAssignedUnits
    );

    return (
      <section className="page-canvas page-canvas--detail">
        <div className="page-body page-body--catalog-create">
          <div className="catalog-create-layout">
            <div className="catalog-create-column catalog-create-column--left">
              <section className="catalog-create-availability-card">
                <div className="catalog-availability-row">
                  <div className="catalog-availability-row__copy">
                    <p className="type-title-3">Catalog Availability</p>
                    <p className="type-body text-secondary">
                      Turn on to make this catalog available
                    </p>
                  </div>
                  <Toggle
                    checked={catalogDraft.availability}
                    onChange={() =>
                      handleCatalogDraftChange(
                        "availability",
                        !catalogDraft.availability
                      )
                    }
                    ariaLabel="Catalog availability"
                  />
                </div>
              </section>

              <section className="catalog-create-photo-panel">
                <div className="catalog-create-photo-panel__header">
                  <p className="type-title-2">Catalog Photo</p>
                  <p className="type-subtitle-2 text-primary">
                    {catalogDraft.photos.length}/5 Photo
                  </p>
                </div>
                <input
                  ref={catalogPhotoInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.heic,image/jpeg,image/png,image/heic,image/heif"
                  multiple
                  hidden
                  onChange={handleCatalogPhotoUpload}
                />
                <div className="catalog-photo-grid">
                  {catalogDraft.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className={`catalog-photo-card${photo.isMain ? " is-main" : ""
                        }`}
                    >
                      <button
                        type="button"
                        className="catalog-photo-card__button"
                        onClick={() => handleSetMainCatalogPhoto(photo.id)}
                        aria-label={`Set ${photo.name} as main photo`}
                      >
                        <span className="catalog-photo-card__media">
                          <img
                            src={photo.url}
                            alt={photo.name}
                            className="catalog-photo-card__image"
                          />
                        </span>
                      </button>
                      <button
                        type="button"
                        className="catalog-photo-card__remove"
                        aria-label={`Remove ${photo.name}`}
                        onClick={() => handleRemoveCatalogPhoto(photo.id)}
                      />
                    </div>
                  ))}
                  {catalogDraft.photos.length < 5 ? (
                    <button
                      type="button"
                      className="catalog-photo-placeholder"
                      onClick={() => catalogPhotoInputRef.current?.click()}
                      aria-label="Upload catalog photo"
                    >
                      <span className="catalog-photo-placeholder__badge">
                        <Icon
                          name="add"
                          className="lab-icon lab-icon--24"
                          alt=""
                        />
                      </span>
                    </button>
                  ) : null}
                </div>
                <div className="catalog-photo-meta">
                  {catalogDraft.photos.length ? (
                    <div className="catalog-photo-info">
                      <Icon
                        name="infoBlue"
                        className="lab-icon lab-icon--16"
                        alt=""
                      />
                      <p className="type-body">
                        Click photo to set as main photo catalog
                      </p>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>

            <div className="catalog-create-column catalog-create-column--right">
              <DetailSection
                title="General Information"
                className="catalog-create-form-card catalog-create-form-card--general"
                bodyClassName="catalog-general-layout"
              >
                <div
                  className={`catalog-general-row${catalogDraft.type === "package" ? " catalog-general-row--single-column" : ""}`}
                >
                  <CatalogTypeField
                    value={catalogDraft.type}
                    onChange={handleCatalogTypeChange}
                  />
                  {catalogDraft.type === "single" ? (
                    <>
                      <div
                        className="catalog-general-spacer"
                        aria-hidden="true"
                      />
                      <div
                        className="catalog-general-spacer"
                        aria-hidden="true"
                      />
                    </>
                  ) : null}
                </div>
                <div className="catalog-general-row">
                  <div className="catalog-name-stack">
                    <DetailField
                      label="Catalog Name"
                      required
                      value={catalogDraft.name}
                      placeholder="Enter Catalog Name"
                      onChange={(value) =>
                        handleCatalogDraftChange("name", value)
                      }
                      error={catalogDraftErrors.name}
                      maxLength={40}
                    />
                    {catalogDraft.additionalNames.map((entry, index) => (
                      <div key={entry.id} className="catalog-additional-name-row">
                        <DetailField
                          label={`Catalog Name #${index + 2}`}
                          value={entry.value}
                          placeholder="Enter Catalog Name"
                          onChange={(value) => handleAdditionalNameChange(entry.id, value)}
                          maxLength={40}
                          error={catalogDraftErrors.additionalNames?.[entry.id]}
                        />
                        <button
                          type="button"
                          className="catalog-additional-name-remove"
                          onClick={() => handleRemoveAdditionalName(entry.id)}
                          aria-label="Remove additional name"
                        >
                          <Icon name="delete" className="lab-icon lab-icon--20" alt="Remove" />
                        </button>
                      </div>
                    ))}
                    {catalogDraft.additionalNames.length < 2 ? (
                      <button
                        type="button"
                        className="catalog-add-name-text"
                        onClick={handleAddAdditionalName}
                      >
                        + Add Another Name
                      </button>
                    ) : null}
                  </div>
                  <DetailSelectField
                    label="Category"
                    required
                    value={catalogDraft.category}
                    options={catalogCategoryOptions}
                    onChange={(value) =>
                      handleCatalogDraftChange("category", value)
                    }
                    placeholder="Select Category"
                    error={catalogDraftErrors.category}
                  />
                  {catalogDraft.type === "single" ? (
                    <CatalogModifierFieldWithModal
                      label="Modifier"
                      value={catalogDraft.modifier}
                      options={catalogModifierOptions}
                      onChange={(value) =>
                        handleCatalogDraftChange("modifier", value)
                      }
                      placeholder="Select Modifier"
                      ellipsis
                    />
                  ) : (
                    <div
                      className="catalog-general-spacer"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </DetailSection>

              {catalogDraft.type === "package" ? (
                <DetailSection
                  title="Package Items"
                  className="catalog-create-form-card catalog-create-form-card--package"
                >
                  <div className="table-scroll">
                    <table className="catalog-package-table">
                      <thead>
                        <tr>
                          <th>
                            <p className="type-title-3">Catalog</p>
                          </th>
                          <th className="catalog-package-table__qty">
                            <p className="type-title-3">Qty</p>
                          </th>
                          <th className="catalog-package-table__price">
                            <p className="type-title-3">Nominal</p>
                          </th>
                          <th className="catalog-package-table__action" />
                        </tr>
                      </thead>
                      <tbody>
                        {packageRows.map((item) => {
                          const matchedCatalog =
                            createPackageCatalogMap[item.catalogId];
                          const itemTotal = matchedCatalog
                            ? matchedCatalog.basePrice * (Number(item.qty) || 0)
                            : 0;
                          const isBlankRow = !item.catalogId;
                          const availablePackageOptions =
                            getAvailableCreatePackageOptions(
                              item.id,
                              item.catalogId
                            );

                          return (
                            <tr
                              key={item.id}
                              className={
                                isBlankRow
                                  ? "catalog-package-table__placeholder"
                                  : ""
                              }
                            >
                              <td>
                                <label className="catalog-package-field">
                                  <PackageItemSelectField
                                    value={item.catalogId}
                                    options={availablePackageOptions}
                                    placeholder="Select Catalog"
                                    onChange={(event) =>
                                      handlePackageItemChange(
                                        item.id,
                                        "catalogId",
                                        event
                                      )
                                    }
                                  />
                                </label>
                              </td>
                              <td>
                                {!isBlankRow ? (
                                  <label className="catalog-package-field">
                                    <input
                                      className="type-subtitle-2"
                                      type="text"
                                      inputMode="numeric"
                                      value={item.qty}
                                      onChange={(event) =>
                                        handlePackageItemChange(
                                          item.id,
                                          "qty",
                                          event.target.value
                                        )
                                      }
                                    />
                                  </label>
                                ) : null}
                              </td>
                              <td className="catalog-package-table__price">
                                {!isBlankRow ? (
                                  <p className="type-subtitle-2">
                                    {formatIdr(itemTotal)}
                                  </p>
                                ) : null}
                              </td>
                              <td className="catalog-package-table__action">
                                {!isBlankRow ? (
                                  <TableActionButton
                                    tooltip="Remove"
                                    onClick={() =>
                                      handleRemovePackageItem(item.id)
                                    }
                                    ariaLabel="Remove package item"
                                  >
                                    <Icon
                                      name="delete"
                                      className="lab-icon lab-icon--16"
                                      alt="Delete"
                                    />
                                  </TableActionButton>
                                ) : null}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {catalogDraftErrors.packageItems ? (
                    <p className="catalog-package-error type-body">
                      Field cannot be empty
                    </p>
                  ) : null}
                </DetailSection>
              ) : null}

              <DetailSection
                title="Pricing Configuration"
                className="catalog-create-form-card catalog-create-form-card--pricing"
                meta={
                  catalogDraft.type === "package" ? (
                    <span className="catalog-detail-section__meta--summary">
                      (Catalog Total Price: {formatIdr(packageTotal)})
                    </span>
                  ) : null
                }
              >
                <div className="catalog-pricing-row">
                  <div className="catalog-detail-field">
                    <PriceField
                      value={catalogDraft.price}
                      onChange={(value) =>
                        handleCatalogDraftChange("price", value)
                      }
                    />
                  </div>
                  <div className="catalog-toggle-field">
                    <span className="catalog-detail-field__label type-body">
                      Allow Override Price
                    </span>
                    <div className="catalog-toggle-field__control">
                      <Toggle
                        checked={catalogDraft.allowOverridePrice}
                        onChange={() =>
                          handleCatalogDraftChange(
                            "allowOverridePrice",
                            !catalogDraft.allowOverridePrice
                          )
                        }
                        ariaLabel="Allow override price"
                      />
                    </div>
                  </div>
                </div>
              </DetailSection>

              <DetailSection
                title="Entity Assignment"
                className="catalog-create-form-card catalog-create-form-card--units"
                bodyClassName="catalog-assignment-layout"
                meta={
                  syncedCatalogDraftAssignedUnits.length ? (
                    <LabButton
                      label="Assign"
                      variant="primary"
                      size="small"
                      icon="add"
                      onClick={openUnitAssignmentModal}
                    />
                  ) : null
                }
              >
                <div className="catalog-assignment-section">
                  {syncedCatalogDraftAssignedUnits.length ? (
                    <div className="catalog-assignment-info">
                      <Icon
                        name="infoBlue"
                        className="lab-icon lab-icon--18"
                        alt=""
                      />
                      <p className="type-body">
                        Price override settings for each entity are
                        managed in Pricing Rule menu
                      </p>
                    </div>
                  ) : null}
                  {syncedCatalogDraftAssignedUnits.length ? (
                    <div className="catalog-assignment-table-wrap table-scroll">
                      <table className="catalog-assignment-table catalog-assignment-table--create">
                        <thead>
                          <tr>
                            <th>
                              <p className="type-title-3">Entity</p>
                            </th>
                            <th className="catalog-assignment-table__value">
                              <p className="type-title-3">Max Override Price</p>
                            </th>
                            {showAssignmentOverridePrice ? (
                              <th className="catalog-assignment-table__value catalog-assignment-table__value--override">
                                <p className="type-title-3">Override Price</p>
                              </th>
                            ) : null}
                            <th className="catalog-assignment-table__action" />
                          </tr>
                        </thead>
                        <tbody>
                          {assignmentRows.map((row) =>
                            row.type === "group" ? (
                              <tr
                                key={row.id}
                                className="catalog-assignment-table__group-row"
                              >
                                <td colSpan={assignmentGroupColSpan}>
                                  <p className="type-subtitle-2">{row.label}</p>
                                </td>
                              </tr>
                            ) : (
                              <tr key={row.id}>
                                <td>
                                  <div className="lab-table__cell-stack">
                                    <p className="type-subtitle-2">{row.name}</p>
                                    {row.subtitle ? (
                                      <p className="lab-table__cell-subtitle type-body text-secondary">
                                        {row.subtitle}
                                      </p>
                                    ) : null}
                                  </div>
                                </td>
                                <td className="catalog-assignment-table__value">
                                  <p className="type-subtitle-2">
                                    {row.maxOverridePrice}
                                  </p>
                                </td>
                                {showAssignmentOverridePrice ? (
                                  <td className="catalog-assignment-table__value catalog-assignment-table__value--override">
                                    <p className="type-subtitle-2">
                                      {row.overridePrice}
                                    </p>
                                  </td>
                                ) : null}
                                <td className="catalog-assignment-table__action">
                                  <button
                                    type="button"
                                    className="catalog-assignment-remove"
                                    aria-label={`Remove ${row.name}`}
                                    onClick={() =>
                                      handleRemoveAssignedUnit(row.id)
                                    }
                                  />
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="catalog-assignment-empty">
                      <p className="catalog-assignment-empty__title type-title-2">
                        Not Assigned Yet
                      </p>
                      <p className="catalog-assignment-empty__copy type-body">
                        Assign this catalog to an entity so it can be used
                      </p>
                      <LabButton
                        label="Assign"
                        variant="primary"
                        size="small"
                        icon="add"
                        onClick={openUnitAssignmentModal}
                      />
                    </div>
                  )}
                </div>
              </DetailSection>
            </div>
          </div>
        </div>
        <div className="detail-action-bar">
          <button
            type="button"
            className="detail-action-bar__cancel type-title-3"
            onClick={closeCatalogCreatePage}
          >
            Cancel Add
          </button>
          <LabButton
            label="Save"
            variant="primary"
            size="medium"
            onClick={handleSaveCatalogDraft}
          />
        </div>
      </section>
    );
  }

  function renderCategoryCreateSidePanel() {
    return (
      <aside className="catalog-detail-side-panel catalog-detail-panel catalog-create-side-panel">
        <div className="catalog-detail-panel__header">
          <div className="catalog-detail-panel__titlebar">
            <p className="catalog-detail-panel__title type-title-2">
              Add New Category
            </p>
            <div className="catalog-detail-panel__actions">
              <button
                type="button"
                className="catalog-detail-panel__close"
                onClick={closeCategoryCreatePage}
                aria-label="Close add category panel"
              >
                <Icon
                  name="panelClose"
                  className="lab-icon lab-icon--16"
                  alt="Close"
                />
              </button>
            </div>
          </div>
        </div>
        <div className="catalog-detail-panel__body">
          <div className="catalog-create-side-panel__content catalog-create-side-panel__content--compact">
            <DetailSection title="General Information">
              <div className="catalog-panel-info-list">
                <DetailField
                  label="Category Name"
                  required
                  value={categoryDraft.name}
                  placeholder="Enter Category Name"
                  onChange={(value) => handleCategoryDraftChange("name", value)}
                  error={categoryDraftErrors.name}
                  maxLength={40}
                  ellipsis
                />
                <DetailSelectField
                  label="Parent Category"
                  required
                  value={categoryDraft.parentCategory}
                  options={categoryParentOptions}
                  onChange={(value) =>
                    handleCategoryDraftChange("parentCategory", value)
                  }
                  placeholder="None (Main Category)"
                  ellipsis
                />
                {(!categoryDraft.parentCategory || categoryDraft.parentCategory === "None (Main Category)") && (
                  <CategoryColorPicker
                    value={categoryDraft.color}
                    onChange={(value) => handleCategoryDraftChange("color", value)}
                  />
                )}
              </div>
            </DetailSection>
          </div>
        </div>
        <div className="catalog-detail-panel__footer">
          <CreatePanelFooter
            isFirstStep
            isLastStep
            onCancel={closeCategoryCreatePage}
            onSubmit={handleSaveCategoryDraft}
            submitLabel="Create Category"
          />
        </div>
      </aside>
    );
  }

  function renderUnitCreateSidePanel() {
    return (
      <aside className="catalog-detail-side-panel catalog-detail-panel catalog-create-side-panel">
        <div className="catalog-detail-panel__header">
          <div className="catalog-detail-panel__titlebar">
            <p className="catalog-detail-panel__title type-title-2">
              Add New Unit
            </p>
            <div className="catalog-detail-panel__actions">
              <button
                type="button"
                className="catalog-detail-panel__close"
                onClick={closeUnitCreatePage}
                aria-label="Close add unit panel"
              >
                <Icon
                  name="panelClose"
                  className="lab-icon lab-icon--16"
                  alt="Close"
                />
              </button>
            </div>
          </div>
        </div>
        <div className="catalog-detail-panel__body">
          <div className="catalog-create-side-panel__content catalog-create-side-panel__content--compact">
            <DetailSection title="General Information">
              <div className="catalog-panel-info-list">
                <DetailField
                  label="Unit Name"
                  required
                  value={unitDraft.name}
                  placeholder="Enter Unit Name"
                  onChange={(value) => handleUnitDraftChange("name", value)}
                  error={unitDraftErrors.name}
                  maxLength={40}
                />
                <DetailSelectField
                  label="Precision"
                  required
                  value={unitDraft.precision}
                  options={UNIT_PRECISION_OPTIONS}
                  onChange={(value) =>
                    handleUnitDraftChange("precision", value)
                  }
                  placeholder="Select Precision"
                />
              </div>
            </DetailSection>
          </div>
        </div>
        <div className="catalog-detail-panel__footer">
          <CreatePanelFooter
            isFirstStep
            isLastStep
            onCancel={closeUnitCreatePage}
            onSubmit={handleSaveUnitDraft}
            submitLabel="Create Unit"
          />
        </div>
      </aside>
    );
  }

  function renderModifierCreateSidePanel() {
    const showEntityAssignmentStep = !selectedSidebarBusinessUnit;
    const steps = showEntityAssignmentStep
      ? [
        { id: "general", label: "General" },
        { id: "options", label: "Options" },
        { id: "units", label: "Entity Assignment" },
      ]
      : [
        { id: "general", label: "General" },
        { id: "options", label: "Options" },
      ];
    const activeStep = Math.min(
      createPanelSteps.modifier ?? 0,
      steps.length - 1
    );
    const modifierAssignmentColumns = getModifierUnitAssignmentColumns(
      modifierDraft.options
    );
    const modifierAssignmentRows = buildCatalogAssignedUnitRows(
      modifierDraft.assignedUnits
    );

    return (
      <aside className="catalog-detail-side-panel catalog-detail-panel catalog-create-side-panel">
        <div className="catalog-detail-panel__header">
          <div className="catalog-detail-panel__titlebar">
            <p className="catalog-detail-panel__title type-title-2">
              Add New Modifier
            </p>
            <div className="catalog-detail-panel__actions">
              <button
                type="button"
                className="catalog-detail-panel__close"
                onClick={closeModifierCreatePage}
                aria-label="Close add modifier panel"
              >
                <Icon
                  name="panelClose"
                  className="lab-icon lab-icon--16"
                  alt="Close"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="catalog-detail-panel__body">
          <div className="catalog-create-side-panel__content">
            <section className="catalog-create-form-card catalog-detail-section">
              <div className="catalog-availability-row">
                <div className="catalog-availability-row__copy">
                  <p className="type-title-3">Modifier Availability</p>
                  <p className="type-body text-secondary">
                    Turn on to make this modifier available
                  </p>
                </div>
                <Toggle
                  checked={modifierDraft.availability}
                  onChange={() =>
                    handleModifierDraftChange(
                      "availability",
                      !modifierDraft.availability
                    )
                  }
                  ariaLabel="Modifier availability"
                />
              </div>
            </section>
            <DetailSection title="General Information">
              <div className="catalog-panel-info-list">
                <div className="catalog-panel-info-list--single-column">
                  <ModifierCreateNameField
                    value={modifierDraft.name}
                    onChange={(value) =>
                      handleModifierDraftChange("name", value)
                    }
                    error={modifierDraftErrors.name}
                    ellipsis
                  />
                </div>
                <div className="modifier-create-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="catalog-create-side-panel__field-stack">
                    <DetailField
                      label="Minimum Selection"
                      value={modifierDraft.minimumSelection}
                      placeholder="0"
                      inputMode="numeric"
                      onChange={(value) =>
                        handleModifierDraftChange("minimumSelection", value)
                      }
                      ellipsis
                    />
                    <p className="catalog-detail-inline-hint type-body text-secondary">
                      If &gt; 0, required
                    </p>
                  </div>
                  <div className="catalog-create-side-panel__field-stack">
                    <DetailField
                      label="Maximum Selection"
                      value={modifierDraft.maximumSelection}
                      placeholder="0"
                      inputMode="numeric"
                      onChange={(value) =>
                        handleModifierDraftChange("maximumSelection", value)
                      }
                      ellipsis
                    />
                    <p className="catalog-detail-inline-hint type-body text-secondary">
                      Limit Selection
                    </p>
                  </div>
                </div>
                {modifierDraftErrors.selectionRange && (
                  <p className="modifier-option-table__field-error type-body" style={{ gridColumn: "1 / -1", width: "100%", marginTop: "4px" }}>
                    {modifierDraftErrors.selectionRange}
                  </p>
                )}
              </div>
            </DetailSection>



            <DetailSection title="Modifier Options">
              <ModifierOptionsTable
                options={modifierDraft.options}
                isEditing={true}
                minimumSelection={modifierDraft.minimumSelection}
                dragOverOptionId={modifierDragOverOptionId}
                optionNameErrors={modifierDraftErrors.optionNames ?? []}
                optionIngredientQtyErrors={
                  modifierDraftErrors.optionIngredientQtys ?? []
                }
                ingredientOptions={MODIFIER_INGREDIENT_OPTION_LABELS}
                onOptionChange={handleModifierOptionChange}
                onRemoveOption={handleRemoveModifierOption}
                onAddOption={handleAddModifierOption}
                onDragStart={handleModifierOptionDragStart}
                onDragEnd={handleModifierOptionDragEnd}
                onDragOver={handleModifierOptionDragOver}
                onDrop={handleModifierOptionDrop}
              />
              {modifierDraftErrors.selectionCount && (
                <p className="modifier-option-table__field-error type-body" style={{ marginTop: "4px" }}>
                  {modifierDraftErrors.selectionCount}
                </p>
              )}
            </DetailSection>

            <DetailSection title="Connected Catalog">
              <div className="catalog-panel-info-list catalog-panel-info-list--single-column">
                <ModifierCatalogModalField
                  label="Catalog List"
                  value={modifierDraft.connectedCatalog}
                  groups={modifierCatalogGroups}
                  onClick={() => openModifierCatalogModal("modifier-create", modifierDraft.connectedCatalog)}
                  placeholder="Select Catalog"
                  ellipsis
                />
              </div>
            </DetailSection>

            {showEntityAssignmentStep ? (
              <DetailSection
                title="Entity Assignment"
                meta={
                  modifierDraft.assignedUnits.length ? (
                    <LabButton
                      label="Assign"
                      variant="primary"
                      size="small"
                      icon="add"
                      onClick={() => openUnitAssignmentModal("modifier-create")}
                    />
                  ) : null
                }
              >
                <div className="catalog-assignment-section">
                  {modifierDraft.assignedUnits.length ? (
                    <>
                      <div className="catalog-assignment-info">
                        <Icon
                          name="infoBlue"
                          className="lab-icon lab-icon--18"
                          alt=""
                        />
                        <p className="type-body">
                          Price override settings for each entity are
                          managed in Pricing Rule menu
                        </p>
                      </div>
                      <div className="modifier-unit-assignment-table-wrap table-scroll">
                        <table className="catalog-assignment-table modifier-unit-assignment-table">
                          <thead>
                            <tr>
                              <th className="modifier-unit-assignment-table__business">
                                <p className="type-title-3">Entity</p>
                              </th>
                              <th className="modifier-unit-assignment-table__max">
                                <p className="type-title-3">
                                  Max Override Price
                                </p>
                              </th>
                              {modifierAssignmentColumns.map((column) => (
                                <th
                                  key={column.id}
                                  className="modifier-unit-assignment-table__modifier"
                                >
                                  <p className="type-title-3">{column.name}</p>
                                </th>
                              ))}
                              <th className="modifier-unit-assignment-table__action" />
                            </tr>
                          </thead>
                          <tbody>
                            {modifierAssignmentRows.map((row) => (
                              <tr key={row.id}>
                                <td className="modifier-unit-assignment-table__business">
                                  <div className="lab-table__cell-stack">
                                    <p className="type-subtitle-2">{row.name}</p>
                                    {row.subtitle ? (
                                      <p className="lab-table__cell-subtitle type-body text-secondary">
                                        {row.subtitle}
                                      </p>
                                    ) : null}
                                  </div>
                                </td>
                                <td className="modifier-unit-assignment-table__max">
                                  <p className="type-subtitle-2">
                                    {row.maxOverridePrice}
                                  </p>
                                </td>
                                {modifierAssignmentColumns.map((column) => (
                                  <td
                                    key={`${row.id}-${column.id}`}
                                    className="modifier-unit-assignment-table__modifier"
                                  >
                                    <p className="type-subtitle-2">
                                      {getModifierUnitAssignmentValue(
                                        column,
                                        row
                                      )}
                                    </p>
                                  </td>
                                ))}
                                <td className="modifier-unit-assignment-table__action">
                                  <button
                                    type="button"
                                    className="catalog-assignment-remove"
                                    aria-label={`Remove ${row.name}`}
                                    onClick={() =>
                                      handleRemoveModifierAssignedUnit(row.id)
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="catalog-assignment-empty">
                      <p className="catalog-assignment-empty__title type-title-2">
                        Not Assigned Yet
                      </p>
                      <p className="catalog-assignment-empty__copy type-body">
                        Assign this modifier to an entity so it can be used
                      </p>
                      <LabButton
                        label="Assign"
                        variant="primary"
                        size="small"
                        icon="add"
                        onClick={() => openUnitAssignmentModal("modifier-create")}
                      />
                    </div>
                  )}
                </div>
              </DetailSection>
            ) : null}
          </div>
        </div>
        <div className="catalog-detail-panel__footer">
          <CreatePanelFooter
            isFirstStep
            isLastStep
            onCancel={closeModifierCreatePage}
            onSubmit={handleSaveModifierDraft}
            submitLabel="Create Modifier"
          />
        </div>
      </aside>
    );
  }

  function renderSellingTimeCreateSidePanel() {
    const activeStep = createPanelSteps["selling-time"] ?? 0;
    const steps = [
      { id: "general", label: "General" },
      { id: "schedule", label: "Schedule" },
    ];

    return (
      <aside className="catalog-detail-side-panel catalog-detail-panel catalog-create-side-panel">
        <div className="catalog-detail-panel__header">
          <div className="catalog-detail-panel__titlebar">
            <p className="catalog-detail-panel__title type-title-2">
              Add New Selling Time
            </p>
            <div className="catalog-detail-panel__actions">
              <button
                type="button"
                className="catalog-detail-panel__close"
                onClick={closeSellingTimeCreatePage}
                aria-label="Close add selling time panel"
              >
                <Icon
                  name="panelClose"
                  className="lab-icon lab-icon--16"
                  alt="Close"
                />
              </button>
            </div>
          </div>
          <CreatePanelStepTabs
            steps={steps}
            activeStep={activeStep}
            onStepSelect={(stepIndex) =>
              handleSellingTimeCreateStepSelect(activeStep, stepIndex)
            }
          />
        </div>
        <div className="catalog-detail-panel__body">
          <div className="catalog-create-side-panel__content">
            {activeStep === 0 ? (
              <DetailSection title="General Information">
                <SellingTimeNameField
                  value={sellingTimeDraft.name}
                  onChange={handleSellingTimeDraftNameChange}
                  error={sellingTimeDraftErrors.name}
                />
                <div className="selling-time-create-info">
                  <Icon
                    name="infoBlue"
                    className="lab-icon lab-icon--16"
                    alt=""
                  />
                  <p className="type-body">
                    Your catalog and categories can be linked to selling times
                    you created
                  </p>
                </div>
              </DetailSection>
            ) : null}
            {activeStep === 1 ? (
              <DetailSection title="Selling Time Configuration">
                <div className="selling-time-schedule-scroll">
                  <table className="selling-time-schedule-table">
                    <colgroup>
                      <col />
                      <col />
                      <col />
                      <col />
                      <col />
                      <col />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>
                          <div className="selling-time-schedule-table__header-copy selling-time-schedule-table__header-copy--day">
                            <p className="type-title-3">Day</p>
                          </div>
                        </th>
                        <th>
                          <div className="selling-time-schedule-table__header-copy">
                            <p className="type-title-3">24 Hours</p>
                          </div>
                        </th>
                        <th>
                          <div className="selling-time-schedule-table__header-copy">
                            <p className="type-title-3">Start Receiving Time</p>
                          </div>
                        </th>
                        <th>
                          <div className="selling-time-schedule-table__header-copy">
                            <p className="type-title-3">End Receiving Time</p>
                          </div>
                        </th>
                        <th>
                          <div className="selling-time-schedule-table__header-copy" />
                        </th>
                        <th>
                          <div className="selling-time-schedule-table__header-copy" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellingTimeDraft.days.map((day) => {
                        const visibleSlots = day.enabled
                          ? day.slots
                          : [{ id: `${day.id}-empty`, start: "", end: "" }];

                        return visibleSlots.map((slot, index) => {
                          const isFirstRow = index === 0;
                          const isLastRow = index === visibleSlots.length - 1;
                          const rowSpan = visibleSlots.length;

                          return (
                            <tr key={slot.id}>
                              {isFirstRow ? (
                                <td
                                  rowSpan={rowSpan}
                                  className={
                                    day.enabled
                                      ? "selling-time-schedule-table__day-cell"
                                      : "selling-time-schedule-table__day-empty"
                                  }
                                >
                                  <div className="selling-time-schedule-table__day-stack">
                                    <Toggle
                                      checked={day.enabled}
                                      onChange={() =>
                                        handleToggleSellingTimeDay(day.id)
                                      }
                                      ariaLabel={`${day.label} availability`}
                                    />
                                    <p className="selling-time-schedule-table__day-label type-subtitle-2">
                                      {day.label}
                                    </p>
                                  </div>
                                </td>
                              ) : null}

                              {isFirstRow ? (
                                day.enabled ? (
                                  <td
                                    rowSpan={rowSpan}
                                    className="selling-time-schedule-table__twenty-four-cell"
                                  >
                                    <label className="selling-time-schedule-table__twenty-four">
                                      <LabCheckbox
                                        checked={day.is24Hours}
                                        onChange={() =>
                                          handleToggleSellingTimeTwentyFourHours(
                                            day.id
                                          )
                                        }
                                        ariaLabel={`Set ${day.label} to 24 hours`}
                                      />
                                      <p className="type-subtitle-2">Yes</p>
                                    </label>
                                  </td>
                                ) : (
                                  <td
                                    rowSpan={rowSpan}
                                    className="selling-time-schedule-table__blank"
                                  />
                                )
                              ) : null}

                              {day.enabled ? (
                                <>
                                  <td className="selling-time-schedule-table__field-cell">
                                    <SellingTimeTimeField
                                      value={slot.start}
                                      disabled={day.is24Hours}
                                      error={Boolean(
                                        sellingTimeDraftErrors[
                                        getSellingTimeSlotErrorKey(
                                          day.id,
                                          slot.id,
                                          "start"
                                        )
                                        ]
                                      )}
                                      onChange={(value) =>
                                        handleSellingTimeSlotChange(
                                          day.id,
                                          slot.id,
                                          "start",
                                          value
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="selling-time-schedule-table__field-cell">
                                    <SellingTimeTimeField
                                      value={slot.end}
                                      disabled={day.is24Hours}
                                      error={Boolean(
                                        sellingTimeDraftErrors[
                                        getSellingTimeSlotErrorKey(
                                          day.id,
                                          slot.id,
                                          "end"
                                        )
                                        ]
                                      )}
                                      onChange={(value) =>
                                        handleSellingTimeSlotChange(
                                          day.id,
                                          slot.id,
                                          "end",
                                          value
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="selling-time-schedule-table__action-cell">
                                    {isLastRow && !day.is24Hours ? (
                                      <button
                                        type="button"
                                        className="selling-time-schedule-table__add-button type-subtitle-2"
                                        onClick={() =>
                                          handleAddSellingTimeSlot(day.id)
                                        }
                                      >
                                        Add Time
                                      </button>
                                    ) : null}
                                  </td>
                                  <td className="selling-time-schedule-table__delete-cell">
                                    <button
                                      type="button"
                                      className="selling-time-schedule-table__delete"
                                      onClick={() =>
                                        handleRemoveSellingTimeSlot(
                                          day.id,
                                          slot.id
                                        )
                                      }
                                      aria-label={`Remove ${day.label} time`}
                                    >
                                      <Icon
                                        name="delete"
                                        className="lab-icon lab-icon--16"
                                        alt=""
                                      />
                                    </button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="selling-time-schedule-table__blank selling-time-schedule-table__empty-slot" />
                                  <td className="selling-time-schedule-table__blank selling-time-schedule-table__empty-slot" />
                                  <td className="selling-time-schedule-table__blank selling-time-schedule-table__empty-slot" />
                                  <td className="selling-time-schedule-table__blank selling-time-schedule-table__empty-slot" />
                                </>
                              )}
                            </tr>
                          );
                        });
                      })}
                    </tbody>
                  </table>
                </div>
              </DetailSection>
            ) : null}
          </div>
        </div>
        <div className="catalog-detail-panel__footer">
          <CreatePanelFooter
            isFirstStep={activeStep === 0}
            isLastStep={activeStep === steps.length - 1}
            onCancel={closeSellingTimeCreatePage}
            onBack={() =>
              setCreatePanelStepValue("selling-time", activeStep - 1)
            }
            onNext={() =>
              handleSellingTimeCreateStepSelect(activeStep, activeStep + 1)
            }
            onSubmit={handleSaveSellingTimeDraft}
            submitLabel="Create Selling Time"
          />
        </div>
      </aside>
    );
  }

  function renderPricingRuleCreateSidePanel() {
    const activeStep = createPanelSteps["pricing-rule"] ?? 0;
    const steps = [
      { id: "general", label: "General" },
      { id: "catalog-price", label: "Catalog Price" },
      { id: "modifier-price", label: "Modifier Price" },
    ];
    const catalogGroups = specialPricingRuleDraft.overrides.catalog;
    const modifierGroups = specialPricingRuleDraft.overrides.modifier;

    return (
      <aside className="catalog-detail-side-panel catalog-detail-panel catalog-create-side-panel">
        <div className="catalog-detail-panel__header">
          <div className="catalog-detail-panel__titlebar">
            <p className="catalog-detail-panel__title type-title-2">
              Add New Special Pricing Rule
            </p>
            <div className="catalog-detail-panel__actions">
              <button
                type="button"
                className="catalog-detail-panel__close"
                onClick={closePricingRuleCreatePage}
                aria-label="Close add special pricing rule panel"
              >
                <Icon
                  name="panelClose"
                  className="lab-icon lab-icon--16"
                  alt="Close"
                />
              </button>
            </div>
          </div>
          <div className="catalog-detail-panel__tabbar">
            <div className="catalog-detail-panel__tabs" role="tablist">
              {steps.map((step, stepIndex) => (
                <button
                  key={step.id}
                  type="button"
                  className={`catalog-detail-panel__tab${activeStep === stepIndex ? " is-active" : ""
                    }`}
                  onClick={() =>
                    handleSpecialPricingRuleCreateStepSelect(
                      activeStep,
                      stepIndex
                    )
                  }
                >
                  {step.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="catalog-detail-panel__body">
          <div className="catalog-create-side-panel__content">
            {activeStep === 0 ? (
              <DetailSection title="General Information">
                <div className="catalog-panel-info-list">
                  <DetailField
                    label="Rule Name"
                    required
                    value={specialPricingRuleDraft.name}
                    placeholder="Enter Rule Name"
                    onChange={(value) =>
                      handleSpecialPricingRuleDraftChange("name", value)
                    }
                    error={specialPricingRuleDraftErrors.name}
                  />
                  <PricingRuleDateField
                    label="Start Date"
                    value={specialPricingRuleDraft.startDate}
                    onChange={(value) =>
                      handleSpecialPricingRuleDraftChange("startDate", value)
                    }
                    placeholder="Select Start Date"
                    error={specialPricingRuleDraftErrors.startDate}
                  />
                  <PricingRuleDateField
                    label="End Date"
                    value={specialPricingRuleDraft.endDate}
                    onChange={(value) =>
                      handleSpecialPricingRuleDraftChange("endDate", value)
                    }
                    placeholder="Select End Date"
                    error={specialPricingRuleDraftErrors.endDate}
                  />
                </div>
              </DetailSection>
            ) : null}
            {activeStep === 1 ? (
              <SpecialPricingRuleOverrideCard
                title="Catalog Override Rules"
                groups={catalogGroups}
                selectedIds={specialPricingRuleDraft.selected.catalog}
                onToggleAll={() =>
                  handleToggleAllSpecialPricingRuleOverrides("catalog")
                }
                onToggleGroup={(group) =>
                  handleToggleSpecialPricingRuleGroup("catalog", group)
                }
                onToggleItem={(itemId) =>
                  handleToggleSpecialPricingRuleItem("catalog", itemId)
                }
                onChangeMaximum={(itemId, value) =>
                  handleSpecialPricingRuleMaximumChange(
                    "catalog",
                    itemId,
                    value
                  )
                }
              />
            ) : null}
            {activeStep === 2 ? (
              <SpecialPricingRuleOverrideCard
                title="Modifier Override Rules"
                groups={modifierGroups}
                selectedIds={specialPricingRuleDraft.selected.modifier}
                onToggleAll={() =>
                  handleToggleAllSpecialPricingRuleOverrides("modifier")
                }
                onToggleGroup={(group) =>
                  handleToggleSpecialPricingRuleGroup("modifier", group)
                }
                onToggleItem={(itemId) =>
                  handleToggleSpecialPricingRuleItem("modifier", itemId)
                }
                onChangeMaximum={(itemId, value) =>
                  handleSpecialPricingRuleMaximumChange(
                    "modifier",
                    itemId,
                    value
                  )
                }
              />
            ) : null}
          </div>
        </div>
        <div className="catalog-detail-panel__footer">
          <CreatePanelFooter
            isFirstStep={activeStep === 0}
            isLastStep={activeStep === steps.length - 1}
            onCancel={closePricingRuleCreatePage}
            onBack={() =>
              setCreatePanelStepValue("pricing-rule", activeStep - 1)
            }
            onNext={() =>
              handleSpecialPricingRuleCreateStepSelect(activeStep, activeStep + 1)
            }
            onSubmit={handleSaveSpecialPricingRuleDraft}
            submitLabel="Create Special Pricing Rule"
          />
        </div>
      </aside>
    );
  }

  function renderCatalogCreateSidePanel() {
    const showEntityAssignmentStep = !selectedSidebarBusinessUnit;
    const steps = showEntityAssignmentStep
      ? [
        { id: "general", label: "General" },
        { id: "units", label: "Entity Assignment" },
      ]
      : [{ id: "general", label: "General" }];
    const activeStep = Math.min(
      createPanelSteps.catalog ?? 0,
      steps.length - 1
    );
    const packageRows = catalogDraft.packageItems;
    const createPackageCatalogMap = packageCatalogMap;
    const showAssignmentOverridePrice = catalogDraft.allowOverridePrice;
    const assignmentGroupColSpan = showAssignmentOverridePrice ? 4 : 3;
    const getAvailableCreatePackageOptions = (rowId, currentCatalogId = "") => {
      const selectedOptions = new Set(
        packageRows
          .filter((row) => row.id !== rowId && row.catalogId)
          .map((row) => row.catalogId)
      );

      return packageCatalogOptions.filter(
        (option) => option === currentCatalogId || !selectedOptions.has(option)
      );
    };

    const assignmentRows = buildCatalogAssignedUnitRows(
      syncedCatalogDraftAssignedUnits
    );

    return (
      <aside className="catalog-detail-side-panel catalog-detail-panel catalog-create-side-panel">
        <div className="catalog-detail-panel__header">
          <div className="catalog-detail-panel__titlebar">
            <p className="catalog-detail-panel__title type-title-2">
              Add New Catalog
            </p>
            <div className="catalog-detail-panel__actions">
              <button
                type="button"
                className="catalog-detail-panel__close"
                onClick={closeCatalogCreatePage}
                aria-label="Close add catalog panel"
              >
                <Icon
                  name="panelClose"
                  className="lab-icon lab-icon--16"
                  alt="Close"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="catalog-detail-panel__body">
          <div className="catalog-create-side-panel__content">
            {activeStep === 0 ? (
              <>
                <section className="catalog-create-form-card catalog-detail-section">
                  <div className="catalog-availability-row">
                    <div className="catalog-availability-row__copy">
                      <p className="type-title-3">Catalog Availability</p>
                      <p className="type-body text-secondary">
                        Turn on to make this catalog available
                      </p>
                    </div>
                    <Toggle
                      checked={catalogDraft.availability}
                      onChange={() =>
                        handleCatalogDraftChange(
                          "availability",
                          !catalogDraft.availability
                        )
                      }
                      ariaLabel="Catalog availability"
                    />
                  </div>
                </section>

                <DetailSection
                  title="General Information"
                  className="catalog-create-form-card"
                >
                  <div className="catalog-panel-info-list">
                    {catalogDraft.type === "package" ? (
                      <div className="catalog-panel-info-list--single-column">
                        <CatalogTypeField
                          value={catalogDraft.type}
                          onChange={handleCatalogTypeChange}
                        />
                      </div>
                    ) : (
                      <CatalogTypeField
                        value={catalogDraft.type}
                        onChange={handleCatalogTypeChange}
                      />
                    )}
                    {catalogDraft.type === "single" ? (
                      <DetailSelectField
                        label="Unit"
                        value={catalogDraft.unit}
                        options={catalogUnitOptions}
                        onChange={(value) =>
                          handleCatalogDraftChange("unit", value)
                        }
                        placeholder="Select Unit"
                      />
                    ) : null}
                    <div className="catalog-panel-info-list--single-column catalog-name-stack">
                      <DetailField
                        label="Catalog Name"
                        required
                        value={catalogDraft.name}
                        placeholder="Enter Catalog Name"
                        onChange={(value) =>
                          handleCatalogDraftChange("name", value)
                        }
                        error={catalogDraftErrors.name}
                        maxLength={40}
                      />
                      {catalogDraft.additionalNames.map((entry, index) => (
                        <div key={entry.id} className="catalog-additional-name-row">
                          <DetailField
                            label={`Catalog Name #${index + 2}`}
                            value={entry.value}
                            placeholder="Enter Catalog Name"
                            onChange={(value) => handleAdditionalNameChange(entry.id, value)}
                            maxLength={40}
                            error={catalogDraftErrors.additionalNames?.[entry.id]}
                          />
                          <button
                            type="button"
                            className="catalog-additional-name-remove"
                            onClick={() => handleRemoveAdditionalName(entry.id)}
                            aria-label="Remove additional name"
                          >
                            <Icon name="delete" className="lab-icon lab-icon--20" alt="Remove" />
                          </button>
                        </div>
                      ))}
                      {catalogDraft.additionalNames.length < 2 ? (
                        <button
                          type="button"
                          className="catalog-add-name-text"
                          onClick={handleAddAdditionalName}
                        >
                          + Add Another Name
                        </button>
                      ) : null}
                    </div>
                    {catalogDraft.type === "single" ? (
                      <DetailSelectField
                        label="Category"
                        required
                        value={catalogDraft.category}
                        options={catalogCategoryOptions}
                        onChange={(value) =>
                          handleCatalogDraftChange("category", value)
                        }
                        placeholder="Select Category"
                        error={catalogDraftErrors.category}
                        treeOptions
                      />
                    ) : null}
                    {catalogDraft.type === "single" ? (
                      <CatalogModifierFieldWithModal
                        label="Modifier"
                        value={catalogDraft.modifier}
                        options={catalogModifierOptions}
                        onChange={(value) =>
                          handleCatalogDraftChange("modifier", value)
                        }
                        placeholder="Select Modifier"
                        ellipsis
                      />
                    ) : null}
                    <div className="catalog-panel-info-list--single-column">
                      <DetailTextAreaField
                        label="Description"
                        value={catalogDraft.description}
                        placeholder="Enter Description"
                        onChange={(value) =>
                          handleCatalogDraftChange("description", value)
                        }
                        maxLength={500}
                      />
                    </div>
                  </div>
                </DetailSection>

                <DetailSection
                  title="Catalog Photo"
                  className="catalog-create-form-card catalog-create-photo-panel"
                  meta={`${catalogDraft.photos.length}/5 Photo`}
                >
                  <input
                    ref={catalogPhotoInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.heic,image/jpeg,image/png,image/heic,image/heif"
                    multiple
                    hidden
                    onChange={handleCatalogPhotoUpload}
                  />
                  <div className="catalog-photo-grid catalog-photo-grid--panel">
                    {catalogDraft.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className={`catalog-photo-card${photo.isMain ? " is-main" : ""
                          }`}
                      >
                        <button
                          type="button"
                          className="catalog-photo-card__button"
                          onClick={() => handleSetMainCatalogPhoto(photo.id)}
                          aria-label={`Set ${photo.name} as main photo`}
                        >
                          <span className="catalog-photo-card__media">
                            <img
                              src={photo.url}
                              alt={photo.name}
                              className="catalog-photo-card__image"
                            />
                          </span>
                        </button>
                        <button
                          type="button"
                          className="catalog-photo-card__remove"
                          aria-label={`Remove ${photo.name}`}
                          onClick={() => handleRemoveCatalogPhoto(photo.id)}
                        />
                      </div>
                    ))}
                    {catalogDraft.photos.length < 5 ? (
                      <button
                        type="button"
                        className="catalog-photo-placeholder"
                        onClick={() => catalogPhotoInputRef.current?.click()}
                        aria-label="Upload catalog photo"
                      >
                        <span className="catalog-photo-placeholder__badge">
                          <Icon
                            name="add"
                            className="lab-icon lab-icon--24"
                            alt=""
                          />
                        </span>
                      </button>
                    ) : null}
                  </div>
                  <div className="catalog-photo-meta">
                    {catalogDraft.photos.length ? (
                      <div className="catalog-photo-info">
                        <Icon
                          name="infoBlue"
                          className="lab-icon lab-icon--16"
                          alt=""
                        />
                        <p className="type-body">
                          Click photo to set as main photo catalog
                        </p>
                      </div>
                    ) : null}
                  </div>
                </DetailSection>


                {catalogDraft.type === "single" ? (
                  <DetailSection
                    title="Recipe"
                    className="catalog-create-form-card catalog-detail-section--toggle-only"
                  >
                    <div className="catalog-panel-info-list catalog-panel-info-list--single-column">
                      <div className="catalog-availability-row">
                        <div className="catalog-availability-row__copy">
                          <p className="type-title-3">Recipe</p>
                          <p className="type-body text-secondary">
                            Track stock movement of ingredients connected as Recipe
                          </p>
                        </div>
                        <Toggle
                          checked={catalogDraft.trackStock}
                          onChange={() =>
                            handleCatalogDraftChange(
                              "trackStock",
                              !catalogDraft.trackStock
                            )
                          }
                          ariaLabel="Track stock"
                        />
                      </div>
                    </div>
                    {catalogDraft.trackStock ? (
                      <div className="table-scroll" style={{ marginTop: "4px" }}>
                        <table className="catalog-package-table">
                          <thead>
                            <tr>
                              <th>
                                <p className="type-title-3">Ingredient Name</p>
                              </th>
                              <th style={{ width: "100px" }} className="catalog-package-table__qty">
                                <p className="type-title-3">Qty</p>
                              </th>
                              <th className="catalog-package-table__action" />
                            </tr>
                          </thead>
                          <tbody>
                            {catalogDraft.ingredients.map((item, index) => {
                              const isBlankRow = !item.name && !item.qty;
                              const availableIngredientOptions = packageCatalogOptions.filter(opt => {
                                const isSelectedInOtherRows = catalogDraft.ingredients.some(ing => ing.id !== item.id && ing.name === opt);
                                return !isSelectedInOtherRows || opt === item.name;
                              });

                              return (
                                <tr
                                  key={item.id}
                                  className={
                                    isBlankRow &&
                                      index === catalogDraft.ingredients.length - 1
                                      ? "catalog-package-table__placeholder"
                                      : ""
                                  }
                                >
                                  <td>
                                    <label className="catalog-package-field">
                                      <PackageItemSelectField
                                        value={item.name}
                                        options={availableIngredientOptions}
                                        placeholder="Select Ingredient"
                                        onChange={(value) =>
                                          handleIngredientChange(
                                            item.id,
                                            "name",
                                            value
                                          )
                                        }
                                      />
                                    </label>
                                  </td>
                                  <td style={{ width: "100px" }}>
                                    {item.name ? (
                                      <div className="catalog-package-field" style={{ position: "relative" }}>
                                        <input
                                          className="type-subtitle-2"
                                          type="text"
                                          inputMode="numeric"
                                          value={item.qty}
                                          onChange={(event) =>
                                            handleIngredientChange(
                                              item.id,
                                              "qty",
                                              event.target.value
                                            )
                                          }
                                          style={{ paddingRight: "30px", width: "100%" }}
                                        />
                                        <span
                                          style={{
                                            position: "absolute",
                                            right: "8px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "#C2C2C2",
                                            fontSize: "12px",
                                            pointerEvents: "none",
                                          }}
                                        >
                                          {item.unit}
                                        </span>
                                      </div>
                                    ) : null}
                                  </td>
                                  <td className="catalog-package-table__action">
                                    {!isBlankRow || index < catalogDraft.ingredients.length - 1 ? (
                                      <TableActionButton
                                        tooltip="Remove"
                                        onClick={() =>
                                          handleRemoveIngredient(item.id)
                                        }
                                        ariaLabel="Remove ingredient"
                                      >
                                        <Icon
                                          name="delete"
                                          className="lab-icon lab-icon--16"
                                          alt="Delete"
                                        />
                                      </TableActionButton>
                                    ) : null}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                  </DetailSection>
                ) : null}


                {catalogDraft.type === "package" ? (
                  <DetailSection
                    title="Package Items"
                    className="catalog-create-form-card"
                  >
                    <div className="table-scroll">
                      <table className="catalog-package-table">
                        <thead>
                          <tr>
                            <th>
                              <p className="type-title-3">Catalog</p>
                            </th>
                            <th className="catalog-package-table__qty">
                              <p className="type-title-3">Qty</p>
                            </th>
                            <th className="catalog-package-table__price">
                              <p className="type-title-3">Nominal</p>
                            </th>
                            <th className="catalog-package-table__action" />
                          </tr>
                        </thead>
                        <tbody>
                          {packageRows.map((item) => {
                            const matchedCatalog =
                              createPackageCatalogMap[item.catalogId];
                            const itemTotal = matchedCatalog
                              ? matchedCatalog.basePrice * (Number(item.qty) || 0)
                              : 0;
                            const isBlankRow = !item.catalogId;
                            const availablePackageOptions =
                              getAvailableCreatePackageOptions(
                                item.id,
                                item.catalogId
                              );

                            return (
                              <tr
                                key={item.id}
                                className={
                                  isBlankRow
                                    ? "catalog-package-table__placeholder"
                                    : ""
                                }
                              >
                                <td>
                                  <label className="catalog-package-field">
                                    <PackageItemSelectField
                                      value={item.catalogId}
                                      options={availablePackageOptions}
                                      placeholder="Select Catalog"
                                      onChange={(event) =>
                                        handlePackageItemChange(
                                          item.id,
                                          "catalogId",
                                          event
                                        )
                                      }
                                    />
                                  </label>
                                </td>
                                <td>
                                  {!isBlankRow ? (
                                    <label className="catalog-package-field">
                                      <input
                                        className="type-subtitle-2"
                                        type="text"
                                        inputMode="numeric"
                                        value={item.qty}
                                        onChange={(event) =>
                                          handlePackageItemChange(
                                            item.id,
                                            "qty",
                                            event.target.value
                                          )
                                        }
                                      />
                                    </label>
                                  ) : null}
                                </td>
                                <td className="catalog-package-table__price">
                                  {!isBlankRow ? (
                                    <p className="type-subtitle-2">
                                      {formatIdr(itemTotal)}
                                    </p>
                                  ) : null}
                                </td>
                                <td className="catalog-package-table__action">
                                  {!isBlankRow ? (
                                    <TableActionButton
                                      tooltip="Remove"
                                      onClick={() =>
                                        handleRemovePackageItem(item.id)
                                      }
                                      ariaLabel="Remove package item"
                                    >
                                      <Icon
                                        name="delete"
                                        className="lab-icon lab-icon--16"
                                        alt="Delete"
                                      />
                                    </TableActionButton>
                                  ) : null}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {catalogDraftErrors.packageItems ? (
                      <p className="catalog-package-error type-body">
                        Field cannot be empty
                      </p>
                    ) : null}
                  </DetailSection>
                ) : null}

                <DetailSection
                  title="Pricing Configuration"
                  className="catalog-create-form-card"
                  meta={
                    catalogDraft.type === "package" ? (
                      <span className="catalog-detail-section__meta--summary">
                        (Catalog Total Price: {formatIdr(packageTotal)})
                      </span>
                    ) : null
                  }
                >
                  <div className="catalog-panel-info-list catalog-panel-info-list--single-column">
                    <div className="catalog-create-side-panel__field-stack">
                      <PriceField
                        value={catalogDraft.price}
                        onChange={(value) =>
                          handleCatalogDraftChange("price", value)
                        }
                        error={catalogDraftErrors.price}
                      />
                    </div>
                  </div>
                </DetailSection>



              </>
            ) : null}

            {showEntityAssignmentStep && activeStep === 1 ? (
              <DetailSection
                title="Entity Assignment"
                className="catalog-create-form-card"
                meta={
                  syncedCatalogDraftAssignedUnits.length ? (
                    <LabButton
                      label="Assign"
                      variant="primary"
                      size="small"
                      icon="add"
                      onClick={openUnitAssignmentModal}
                    />
                  ) : null
                }
              >
                <div className="catalog-assignment-section">
                  {syncedCatalogDraftAssignedUnits.length ? (
                    <div className="catalog-assignment-info">
                      <Icon
                        name="infoBlue"
                        className="lab-icon lab-icon--18"
                        alt=""
                      />
                      <p className="type-body">
                        Price override settings for each entity are
                        managed in Pricing Rule menu
                      </p>
                    </div>
                  ) : null}
                  {syncedCatalogDraftAssignedUnits.length ? (
                    <div className="catalog-assignment-table-wrap table-scroll">
                      <table className="catalog-assignment-table catalog-assignment-table--create">
                        <thead>
                          <tr>
                            <th>
                              <p className="type-title-3">Entity</p>
                            </th>
                            <th className="catalog-assignment-table__value">
                              <p className="type-title-3">Max Override Price</p>
                            </th>
                            {showAssignmentOverridePrice ? (
                              <th className="catalog-assignment-table__value catalog-assignment-table__value--override">
                                <p className="type-title-3">Override Price</p>
                              </th>
                            ) : null}
                            <th className="catalog-assignment-table__action" />
                          </tr>
                        </thead>
                        <tbody>
                          {assignmentRows.map((row) =>
                            row.type === "group" ? (
                              <tr
                                key={row.id}
                                className="catalog-assignment-table__group-row"
                              >
                                <td colSpan={assignmentGroupColSpan}>
                                  <p className="type-subtitle-2">{row.label}</p>
                                </td>
                              </tr>
                            ) : (
                              <tr key={row.id}>
                                <td>
                                  <div className="lab-table__cell-stack">
                                    <p className="type-subtitle-2">{row.name}</p>
                                    {row.subtitle ? (
                                      <p className="lab-table__cell-subtitle type-body text-secondary">
                                        {row.subtitle}
                                      </p>
                                    ) : null}
                                  </div>
                                </td>
                                <td className="catalog-assignment-table__value">
                                  <p className="type-subtitle-2">
                                    {row.maxOverridePrice}
                                  </p>
                                </td>
                                {showAssignmentOverridePrice ? (
                                  <td className="catalog-assignment-table__value catalog-assignment-table__value--override">
                                    <p className="type-subtitle-2">
                                      {row.overridePrice}
                                    </p>
                                  </td>
                                ) : null}
                                <td className="catalog-assignment-table__action">
                                  <button
                                    type="button"
                                    className="catalog-assignment-remove"
                                    aria-label={`Remove ${row.name}`}
                                    onClick={() =>
                                      handleRemoveAssignedUnit(row.id)
                                    }
                                  />
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="catalog-assignment-empty">
                      <p className="catalog-assignment-empty__title type-title-2">
                        Not Assigned Yet
                      </p>
                      <p className="catalog-assignment-empty__copy type-body">
                        Assign this catalog to an entity so it can be used
                      </p>
                      <LabButton
                        label="Assign"
                        variant="primary"
                        size="small"
                        icon="add"
                        onClick={openUnitAssignmentModal}
                      />
                    </div>
                  )}
                </div>
              </DetailSection>
            ) : null}
          </div>
        </div>
        <div className="catalog-detail-panel__footer">
          <CreatePanelFooter
            isFirstStep={activeStep === 0}
            isLastStep={activeStep === steps.length - 1}
            onCancel={closeCatalogCreatePage}
            onBack={() => setCreatePanelStepValue("catalog", activeStep - 1)}
            onNext={() => handleCatalogCreateNextStep(activeStep)}
            onSubmit={handleSaveCatalogDraft}
            submitLabel="Create Catalog"
          />
        </div>
      </aside>
    );
  }

  function getCatalogDetailViewModel() {
    if (!catalogDetailDraft) return null;

    const isEditing = catalogDetailEditing?.kind === "all";
    const showDetailAssignmentOverridePrice = true;
    const detailAssignmentGroupColSpan = 4;
    const currentCatalogRecord = (records.catalog || []).find(
      (row) => row.id === catalogDetailDraft.id
    );
    const resolvedCurrentCatalogName =
      catalogDetailDraft.name.trim() ||
      currentCatalogRecord?.name ||
      catalogDetailDraft.name;
    const detailPackageCatalogRecords = (records.catalog || []).map((row) =>
      row.id === catalogDetailDraft.id
        ? { ...row, name: resolvedCurrentCatalogName }
        : row
    );
    const detailPackageCatalogMap = Object.fromEntries(
      detailPackageCatalogRecords.map((row) => [row.name, row])
    );
    const packageOptions = detailPackageCatalogRecords
      .map((row) => row.name)
      .filter((option) => option && option !== resolvedCurrentCatalogName);
    const detailPackageRows = catalogDetailDraft.packageItems;
    const getAvailablePackageOptions = (rowId, currentCatalogId = "") => {
      const selectedOptions = new Set(
        detailPackageRows
          .filter((row) => row.id !== rowId && row.catalogId)
          .map((row) => row.catalogId)
      );

      return packageOptions.filter(
        (option) => option === currentCatalogId || !selectedOptions.has(option)
      );
    };

    const assignmentRows = buildCatalogAssignedUnitRows(
      catalogDetailDraft.assignedUnits
    );

    return {
      assignmentRows,
      currentCatalogRecord,
      detailAssignmentGroupColSpan,
      detailPackageCatalogMap,
      detailPackageRows,
      getAvailablePackageOptions,
      handlePanelTableScroll: handleCatalogDetailPanelTableScroll,
      isEditing,
      showDetailAssignmentOverridePrice,
    };
  }

  function renderCatalogDetailGeneralPanel(detailView) {
    if (!catalogDetailDraft || !detailView) return null;

    const {
      handlePanelTableScroll,
      detailPackageCatalogMap,
      detailPackageRows,
      getAvailablePackageOptions,
      isEditing,
    } = detailView;
    const visiblePackageRows = isEditing
      ? detailPackageRows
      : detailPackageRows.filter((item) => item.catalogId);

    return (
      <>
        <section className="catalog-create-form-card catalog-detail-section">
          <div className="catalog-availability-row">
            <div className="catalog-availability-row__copy">
              <p className="catalog-panel-availability__title type-title-3">
                Catalog Availability
              </p>
              <p className="type-body text-secondary">
                Turn on to make this catalog available
              </p>
            </div>
            <Toggle
              checked={catalogDetailDraft.availability !== false}
              onChange={
                !isLockedSelectedBusinessUnit
                  ? handleToggleCatalogDetailAvailability
                  : undefined
              }
              ariaLabel="Catalog availability"
            />
          </div>
        </section>

        <DetailSection
          title="General Information"
          className="catalog-create-form-card"
        >
          <div
            className="catalog-panel-info-list"
            data-catalog-detail-editor={isEditing ? "true" : undefined}
          >
            {isEditing ? (
              <>
                {catalogDetailDraft.type === "package" ? (
                  <div className="catalog-panel-info-list--single-column">
                    <CatalogTypeField
                      value={catalogDetailDraft.type}
                      onChange={(value) => {
                        const nextDraft = getNextCatalogDetailTypeDraft(
                          catalogDetailDraft,
                          value
                        );
                        setCatalogDetailDraft(nextDraft);
                        catalogDetailDraftRef.current = nextDraft;
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <CatalogTypeField
                      value={catalogDetailDraft.type}
                      onChange={(value) => {
                        const nextDraft = getNextCatalogDetailTypeDraft(
                          catalogDetailDraft,
                          value
                        );
                        setCatalogDetailDraft(nextDraft);
                        catalogDetailDraftRef.current = nextDraft;
                      }}
                    />
                    <DetailSelectField
                      label="Unit"
                      value={catalogDetailDraft.unit}
                      options={catalogUnitOptions}
                      onChange={(value) => handleCatalogDetailChange("unit", value)}
                      placeholder="Select Unit"
                    />
                  </>
                )}
                <div className="catalog-panel-info-list--single-column catalog-name-stack">
                  <DetailField
                    label="Catalog Name"
                    required
                    value={catalogDetailDraft.name}
                    placeholder="Enter Catalog Name"
                    onChange={(value) => handleCatalogDetailChange("name", value)}
                    error={catalogDetailDraftErrors.name}
                    maxLength={40}
                  />
                  {(catalogDetailDraft.additionalNames ?? []).map((entry, index) => (
                    <div key={entry.id} className="catalog-additional-name-row">
                      <DetailField
                        label={`Catalog Name #${index + 2}`}
                        value={entry.value}
                        placeholder="Enter Catalog Name"
                        onChange={(value) =>
                          handleCatalogDetailAdditionalNameChange(entry.id, value)
                        }
                        maxLength={40}
                        error={catalogDetailDraftErrors.additionalNames?.[entry.id]}
                      />
                      <button
                        type="button"
                        className="catalog-additional-name-remove"
                        onClick={() => handleRemoveCatalogDetailAdditionalName(entry.id)}
                        aria-label="Remove additional name"
                      >
                        <Icon name="delete" className="lab-icon lab-icon--20" alt="Remove" />
                      </button>
                    </div>
                  ))}
                  {(catalogDetailDraft.additionalNames ?? []).length < 2 ? (
                    <button
                      type="button"
                      className="catalog-add-name-text"
                      onClick={handleAddCatalogDetailAdditionalName}
                    >
                      + Add Another Name
                    </button>
                  ) : null}
                </div>
                {catalogDetailDraft.type === "single" ? (
                  <DetailSelectField
                    label="Category"
                    required
                    value={catalogDetailDraft.category}
                    options={catalogCategoryOptions}
                    onChange={(value) =>
                      handleCatalogDetailChange("category", value)
                    }
                    error={catalogDetailDraftErrors.category}
                    placeholder="Select Category"
                    treeOptions
                  />
                ) : null}
                {catalogDetailDraft.type === "single" ? (
                  <CatalogModifierFieldWithModal
                    label="Modifier"
                    value={catalogDetailDraft.modifier}
                    options={catalogModifierOptions}
                    onChange={(value) =>
                      handleCatalogDetailChange("modifier", value)
                    }
                    placeholder="Select Modifier"
                    ellipsis
                  />
                ) : null}
                <div className="catalog-panel-info-list--single-column">
                  <DetailTextAreaField
                    label="Description"
                    value={catalogDetailDraft.description}
                    placeholder="Enter Description"
                    onChange={(value) =>
                      handleCatalogDetailChange("description", value)
                    }
                    maxLength={500}
                  />
                </div>
              </>
            ) : (
              <>
                {catalogDetailDraft.type === "package" ? (
                  <div className="catalog-panel-info-list--single-column">
                    <CatalogPanelInfoRow
                      label="Catalog Type"
                      value={
                        catalogDetailDraft.type === "package"
                          ? "Package"
                          : "Single Product"
                      }
                    />
                  </div>
                ) : (
                  <>
                    <CatalogPanelInfoRow
                      label="Catalog Type"
                      value={
                        catalogDetailDraft.type === "package"
                          ? "Package"
                          : "Single Product"
                      }
                    />
                    <CatalogPanelInfoRow
                      label="Unit"
                      value={catalogDetailDraft.unit || "Pcs"}
                    />
                  </>
                )}
                <div className="catalog-panel-info-list--single-column">
                  <CatalogPanelInfoRow
                    label="Catalog Name"
                    value={catalogDetailDraft.name}
                  />
                </div>
                {(catalogDetailDraft.additionalNames ?? []).filter((e) => e.value).map((entry, index) => (
                  <div key={entry.id} className="catalog-panel-info-list--single-column">
                    <CatalogPanelInfoRow
                      label={`Catalog Name #${index + 2}`}
                      value={entry.value}
                    />
                  </div>
                ))}
                {catalogDetailDraft.type === "single" ? (
                  <CatalogPanelInfoRow
                    label="Category"
                    value={catalogDetailDraft.category}
                  />
                ) : null}
                {catalogDetailDraft.type === "single" ? (
                  <CatalogPanelInfoRow
                    label="Modifier"
                    value={getCatalogModifierDetailValue(catalogDetailDraft.modifier)}
                  />
                ) : null}
                <div className="catalog-panel-info-list--single-column">
                  <CatalogPanelInfoRow
                    label="Description"
                    value={catalogDetailDraft.description}
                  />
                </div>
              </>
            )}
          </div>
        </DetailSection>

        {(!isEditing && catalogDetailDraft.photos.length === 0) ? null : (
          <DetailSection
            title="Catalog Photo"
            className="catalog-create-form-card"
            meta={`${catalogDetailDraft.photos.length}/5 Photo`}
          >
            <input
              ref={catalogDetailPhotoInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.heic,image/jpeg,image/png,image/heic,image/heif"
              multiple
              hidden
              onChange={handleCatalogDetailPhotoUpload}
            />
            <div className="catalog-photo-grid catalog-photo-grid--panel">
              {catalogDetailDraft.photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`catalog-photo-card${photo.isMain ? " is-main" : ""
                    }`}
                >
                  <button
                    type="button"
                    className="catalog-photo-card__button"
                    onClick={
                      isEditing
                        ? () => handleSetMainCatalogDetailPhoto(photo.id)
                        : undefined
                    }
                    disabled={!isEditing || isLockedSelectedBusinessUnit}
                    aria-label={`Set ${photo.name} as main photo`}
                  >
                    <span className="catalog-photo-card__media">
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="catalog-photo-card__image"
                      />
                    </span>
                  </button>
                  {isEditing ? (
                    <button
                      type="button"
                      className="catalog-photo-card__remove"
                      disabled={isLockedSelectedBusinessUnit}
                      aria-label={`Remove ${photo.name}`}
                      onClick={() => handleRemoveCatalogDetailPhoto(photo.id)}
                    />
                  ) : null}
                </div>
              ))}
              {isEditing && catalogDetailDraft.photos.length < 5 ? (
                <button
                  type="button"
                  className="catalog-photo-placeholder"
                  onClick={() => catalogDetailPhotoInputRef.current?.click()}
                  aria-label="Upload catalog photo"
                >
                  <span className="catalog-photo-placeholder__badge">
                    <Icon name="add" className="lab-icon lab-icon--24" alt="" />
                  </span>
                </button>
              ) : null}
            </div>
            {isEditing && catalogDetailDraft.photos.length ? (
              <div className="catalog-photo-meta">
                <div className="catalog-photo-info">
                  <Icon
                    name="infoBlue"
                    className="lab-icon lab-icon--16"
                    alt=""
                  />
                  <p className="type-body">
                    Click photo to set as main photo catalog
                  </p>
                </div>
              </div>
            ) : null}
          </DetailSection>
        )}


        {catalogDetailDraft.type === "single" ? (
          <DetailSection
            title="Recipe"
            className={`catalog-create-form-card${isEditing
              ? " catalog-detail-section--toggle-only"
              : !catalogDetailDraft.trackStock
                ? " catalog-detail-section--status-only"
                : ""
              }`}
            meta={
              !isEditing ? (
                <StatusPill
                  status={catalogDetailDraft.trackStock ? "Track Stock" : "No Track"}
                />
              ) : null
            }
          >
            {isEditing ? (
              <div className="catalog-panel-info-list catalog-panel-info-list--single-column">
                <div className="catalog-availability-row">
                  <div className="catalog-availability-row__copy">
                    <p className="type-title-3">Recipe</p>
                    <p className="type-body text-secondary">
                      Track stock movement of ingredients connected as Recipe
                    </p>
                  </div>
                  <div className="catalog-availability-row__control">
                    <Toggle
                      checked={catalogDetailDraft.trackStock}
                      onChange={
                        !isLockedSelectedBusinessUnit
                          ? () => handleCatalogDetailChange("trackStock", !catalogDetailDraft.trackStock)
                          : undefined
                      }
                      ariaLabel="Track stock"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {catalogDetailDraft.trackStock ? (
              <div className="table-scroll" style={{ marginTop: isEditing ? "4px" : "0" }}>
                <table className="catalog-package-table catalog-package-table--panel">
                  <thead>
                    <tr>
                      <th>
                        <p className="type-title-3">Ingredient Name</p>
                      </th>
                      <th style={{ width: "100px" }} className="catalog-package-table__qty">
                        <p className="type-title-3">Qty</p>
                      </th>
                      <th className="catalog-package-table__action" />
                    </tr>
                  </thead>
                  <tbody>
                    {catalogDetailDraft.ingredients.map((item, index) => {
                      const isBlankRow = !item.name && !item.qty;
                      if (!isEditing && isBlankRow) return null;

                      const availableIngredientOptions = packageCatalogOptions.filter(opt => {
                        const isSelectedInOtherRows = catalogDetailDraft.ingredients.some(ing => ing.id !== item.id && ing.name === opt);
                        return !isSelectedInOtherRows || opt === item.name;
                      });

                      return (
                        <tr
                          key={item.id}
                          className={
                            isEditing && isBlankRow && index === catalogDetailDraft.ingredients.length - 1
                              ? "catalog-package-table__placeholder"
                              : ""
                          }
                        >
                          <td>
                            {isEditing ? (
                              <label className="catalog-package-field">
                                <PackageItemSelectField
                                  value={item.name}
                                  options={availableIngredientOptions}
                                  placeholder="Select Ingredient"
                                  onChange={(value) =>
                                    handleCatalogDetailIngredientChange(
                                      item.id,
                                      "name",
                                      value
                                    )
                                  }
                                />
                              </label>
                            ) : (
                              <p className="type-subtitle-2">{item.name}</p>
                            )}
                          </td>
                          <td style={{ width: "100px" }}>
                            {isEditing ? (
                              item.name ? (
                                <div className="catalog-package-field" style={{ position: "relative" }}>
                                  <input
                                    className={`type-subtitle-2 ${!item.qty && catalogDetailDraftErrors.ingredients ? 'catalog-package-field--error' : ''}`}
                                    type="text"
                                    inputMode="numeric"
                                    value={item.qty}
                                    onChange={(event) =>
                                      handleCatalogDetailIngredientChange(
                                        item.id,
                                        "qty",
                                        event.target.value
                                      )
                                    }
                                    style={{ paddingRight: "30px", width: "100%" }}
                                  />
                                  <span
                                    style={{
                                      position: "absolute",
                                      right: "8px",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      color: "#C2C2C2",
                                      fontSize: "12px",
                                      pointerEvents: "none",
                                    }}
                                  >
                                    {item.unit || "g"}
                                  </span>
                                </div>
                              ) : null
                            ) : (
                              <p className="type-subtitle-2">
                                {item.qty}
                                <span style={{ color: "#C2C2C2", marginLeft: "4px" }}>
                                  {item.unit || "g"}
                                </span>
                              </p>
                            )}
                          </td>
                          <td className="catalog-package-table__action">
                            {isEditing && (!isBlankRow || index < catalogDetailDraft.ingredients.length - 1) ? (
                              <TableActionButton
                                tooltip="Remove"
                                onClick={() =>
                                  handleRemoveCatalogDetailIngredient(item.id)
                                }
                                ariaLabel="Remove ingredient"
                              >
                                <Icon
                                  name="delete"
                                  className="lab-icon lab-icon--16"
                                  alt="Delete"
                                />
                              </TableActionButton>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {catalogDetailDraftErrors.ingredients ? (
                  <p className="catalog-package-error type-body">
                    Field cannot be empty
                  </p>
                ) : null}
              </div>
            ) : null}
          </DetailSection>
        ) : null}


        {catalogDetailDraft.type === "package" ? (
          <DetailSection
            title="Package Items"
            className="catalog-create-form-card"
          >
            <div
              ref={catalogDetailPackageTableScrollRef}
              className="table-scroll catalog-detail-panel__table-scroll catalog-detail-panel__table-scroll--package"
              data-scroll-left="false"
              data-scroll-right="false"
              onScroll={handlePanelTableScroll}
            >
              <table className="catalog-package-table catalog-package-table--detail catalog-package-table--panel">
                <thead>
                  <tr>
                    <th>
                      <p className="type-title-3">Catalog</p>
                    </th>
                    <th className="catalog-package-table__qty">
                      <p className="type-title-3">Qty</p>
                    </th>
                    <th className="catalog-package-table__price">
                      <p className="type-title-3">Nominal (IDR)</p>
                    </th>
                    <th className="catalog-package-table__action" />
                  </tr>
                </thead>
                <tbody>
                  {visiblePackageRows.map((item) => {
                    const matchedCatalog =
                      detailPackageCatalogMap[item.catalogId];
                    const itemTotal = matchedCatalog
                      ? matchedCatalog.basePrice * (Number(item.qty) || 0)
                      : 0;
                    const isBlankRow = !item.catalogId;
                    const availablePackageOptions = getAvailablePackageOptions(
                      item.id,
                      item.catalogId
                    );

                    if (isEditing && isBlankRow) {
                      return (
                        <tr
                          key={item.id}
                          className="catalog-package-table__placeholder"
                        >
                          <td>
                            <label className="catalog-package-field catalog-package-field--compact">
                              <PackageItemSelectField
                                value={item.catalogId}
                                options={availablePackageOptions}
                                placeholder="Select Catalog"
                                disabled={isLockedSelectedBusinessUnit}
                                onChange={(event) =>
                                  handleCatalogDetailPackageItemChange(
                                    item.id,
                                    "catalogId",
                                    event
                                  )
                                }
                              />
                            </label>
                          </td>
                          <td />
                          <td className="catalog-package-table__price" />
                          <td className="catalog-package-table__action" />
                        </tr>
                      );
                    }

                    if (isEditing) {
                      return (
                        <tr
                          key={item.id}
                          data-catalog-detail-editor="true"
                        >
                          <td>
                            <label className="catalog-package-field catalog-package-field--compact">
                              <PackageItemSelectField
                                value={item.catalogId}
                                options={availablePackageOptions}
                                placeholder="Select Catalog"
                                onChange={(event) =>
                                  handleCatalogDetailPackageItemChange(
                                    item.id,
                                    "catalogId",
                                    event
                                  )
                                }
                              />
                            </label>
                          </td>
                          <td>
                            <label className="catalog-package-field catalog-package-field--compact">
                              <input
                                className="type-subtitle-2"
                                type="text"
                                inputMode="numeric"
                                value={item.qty}
                                onChange={(event) =>
                                  handleCatalogDetailPackageItemChange(
                                    item.id,
                                    "qty",
                                    event.target.value
                                  )
                                }
                              />
                            </label>
                          </td>
                          <td className="catalog-package-table__price">
                            <p className="type-subtitle-2">
                              {formatIdr(itemTotal)}
                            </p>
                          </td>
                          <td className="catalog-package-table__action">
                            <div className="catalog-package-table__action-group">
                              <TableActionButton
                                tooltip="Remove"
                                onClick={() =>
                                  handleRemoveCatalogDetailPackageItem(item.id)
                                }
                                ariaLabel="Remove package item"
                              >
                                <Icon
                                  name="delete"
                                  className="lab-icon lab-icon--16"
                                  alt="Delete"
                                />
                              </TableActionButton>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="catalog-package-table__cell-copy">
                            <p className="type-subtitle-2">{item.catalogId}</p>
                          </div>
                        </td>
                        <td>
                          <div className="catalog-package-table__cell-copy">
                            <p className="type-subtitle-2">{item.qty}x</p>
                          </div>
                        </td>
                        <td className="catalog-package-table__price">
                          <div className="catalog-package-table__cell-copy">
                            <p className="type-subtitle-2">
                              {formatIdr(itemTotal)}
                            </p>
                          </div>
                        </td>
                        <td className="catalog-package-table__action">
                          <div className="catalog-package-table__action-group" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DetailSection>
        ) : null}

        <DetailSection
          title="Pricing Configuration"
          className="catalog-create-form-card"
          meta={
            catalogDetailDraft.type === "package" ? (
              <span className="catalog-detail-section__meta--summary">
                (Catalog Total Price: {formatIdr(catalogDetailPackageTotal)})
              </span>
            ) : null
          }
        >
          <div
            className="catalog-panel-info-list catalog-panel-info-list--single-column"
            data-catalog-detail-editor={isEditing ? "true" : undefined}
          >
            {isEditing ? (
              <PriceField
                value={catalogDetailDraft.price}
                onChange={(value) =>
                  handleCatalogDetailChange("price", value)
                }
              />
            ) : (
              <CatalogPanelInfoRow
                label="Price"
                value={formatIdr(Number(catalogDetailDraft.price || 0))}
              />
            )}
          </div>
        </DetailSection>


      </>
    );
  }

  function renderCatalogDetailUnitAssignmentPanel(detailView) {
    if (!catalogDetailDraft || !detailView) return null;

    const {
      assignmentRows,
      detailAssignmentGroupColSpan,
      handlePanelTableScroll,
      isEditing,
      showDetailAssignmentOverridePrice,
    } = detailView;

    return (
      <DetailSection
        title="Entity Assignment"
        className="catalog-create-form-card"
        bodyClassName="catalog-assignment-layout"
        meta={
          isEditing && catalogDetailDraft.assignedUnits.length ? (
            <LabButton
              label="Assign"
              variant="primary"
              size="small"
              icon="add"
              disabled={isLockedSelectedBusinessUnit}
              onClick={() => openUnitAssignmentModal("detail")}
            />
          ) : null
        }
      >
        <div className="catalog-assignment-section">
          {catalogDetailDraft.assignedUnits.length ? (
            <>
              <div className="catalog-assignment-info">
                <Icon
                  name="infoBlue"
                  className="lab-icon lab-icon--18"
                  alt=""
                />
                <p className="type-body">
                  Price override settings for each entity are managed in
                  Pricing Rule menu
                </p>
              </div>
              <div
                ref={catalogDetailAssignmentTableScrollRef}
                className="catalog-assignment-table-wrap table-scroll catalog-detail-panel__table-scroll catalog-detail-panel__table-scroll--assignment"
                data-scroll-left="false"
                data-scroll-right="false"
                onScroll={handlePanelTableScroll}
              >
                <table className="catalog-assignment-table catalog-assignment-table--panel">
                  <thead>
                    <tr>
                      <th>
                        <p className="type-title-3">Entity</p>
                      </th>
                      <th className="catalog-assignment-table__value">
                        <p className="type-title-3">Maximum</p>
                      </th>
                      {showDetailAssignmentOverridePrice ? (
                        <th className="catalog-assignment-table__value catalog-assignment-table__value--override">
                          <p className="type-title-3">Override Price</p>
                        </th>
                      ) : null}
                      <th className="catalog-assignment-table__action" />
                    </tr>
                  </thead>
                  <tbody>
                    {assignmentRows.map((row) => {
                      if (row.type === "group") {
                        return (
                          <tr
                            key={row.id}
                            className="catalog-assignment-table__group-row"
                          >
                            <td colSpan={detailAssignmentGroupColSpan}>
                              <div className="catalog-assignment-table__group-label">
                                <p className="type-subtitle-2">{row.label}</p>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={row.id}>
                          <td>
                            <div className="catalog-assignment-table__cell-button">
                              <div className="lab-table__cell-stack">
                                <p className="type-subtitle-2">{row.name}</p>
                                {row.subtitle ? (
                                  <p className="lab-table__cell-subtitle type-body text-secondary">
                                    {row.subtitle}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="catalog-assignment-table__value">
                            <div className="catalog-assignment-table__cell-button">
                              <p className="type-subtitle-2">
                                {row.maxOverridePrice}
                              </p>
                            </div>
                          </td>
                          {showDetailAssignmentOverridePrice ? (
                            <td className="catalog-assignment-table__value catalog-assignment-table__value--override">
                              <div className="catalog-assignment-table__cell-button">
                                <p className="type-subtitle-2">
                                  {row.overridePrice}
                                </p>
                              </div>
                            </td>
                          ) : null}
                          <td className="catalog-assignment-table__action">
                            <button
                              type="button"
                              className="catalog-assignment-remove"
                              disabled={!isEditing || isLockedSelectedBusinessUnit}
                              aria-label={`Remove ${row.name}`}
                              onClick={() =>
                                handleRemoveCatalogDetailAssignedUnit(row.id)
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="catalog-assignment-empty">
              <p className="catalog-assignment-empty__title type-title-2">
                Not Assigned Yet
              </p>
              <p className="catalog-assignment-empty__copy type-body">
                Assign this catalog to an entity so it can be used
              </p>
              {isEditing ? (
                <LabButton
                  label="Assign"
                  variant="primary"
                  size="small"
                  icon="add"
                  disabled={isLockedSelectedBusinessUnit}
                  onClick={() => openUnitAssignmentModal("detail")}
                />
              ) : null}
            </div>
          )}
        </div>
      </DetailSection>
    );
  }

  function renderCatalogDetailSidePanel(detailView) {
    if (!catalogDetailDraft || !detailView) return null;
    const showEntityAssignmentTab = !selectedSidebarBusinessUnit;
    const activeCatalogDetailTab = showEntityAssignmentTab
      ? catalogDetailPanelTab
      : "general";
    const isEditing = detailView.isEditing;
    const effectiveCatalogName =
      catalogDetailDraft.name.trim() ||
      detailView.currentCatalogRecord?.name ||
      "-";

    return (
      <aside className="catalog-detail-side-panel catalog-detail-panel">
        <div className="catalog-detail-panel__header">
          <div className="catalog-detail-panel__titlebar">
            <p className="catalog-detail-panel__title type-title-2">
              {effectiveCatalogName}
            </p>
            <div className="catalog-detail-panel__actions">
              {!isEditing && (
                <button
                  type="button"
                  className="lab-button lab-button--small lab-button--secondary"
                  onClick={() => beginCatalogDetailEdit({ kind: "all" })}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Icon name="edit" className="lab-icon lab-icon--16" alt="" />
                  <span className="type-subtitle-2">Edit</span>
                </button>
              )}
              <button
                type="button"
                className="catalog-detail-panel__close"
                onClick={closeCatalogDetailPage}
                aria-label="Close catalog detail"
              >
                <Icon
                  name="panelClose"
                  className="lab-icon lab-icon--16"
                  alt="Close"
                />
              </button>
            </div>
          </div>
          {showEntityAssignmentTab ? (
            <div className="catalog-detail-panel__tabbar">
              <div className="catalog-detail-panel__tabs" role="tablist">
                <button
                  type="button"
                  className={`catalog-detail-panel__tab${activeCatalogDetailTab === "general" ? " is-active" : ""
                    }`}
                  onClick={() => setCatalogDetailPanelTab("general")}
                >
                  General
                </button>
                <button
                  type="button"
                  className={`catalog-detail-panel__tab${activeCatalogDetailTab === "unit-assignment"
                    ? " is-active"
                    : ""
                    }`}
                  onClick={() => setCatalogDetailPanelTab("unit-assignment")}
                >
                  Entity Assignment
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="catalog-detail-panel__body">
          {activeCatalogDetailTab === "general"
            ? renderCatalogDetailGeneralPanel(detailView)
            : renderCatalogDetailUnitAssignmentPanel(detailView)}
        </div>
        {isEditing ? (
          <div className="catalog-detail-panel__footer" style={{ display: "flex", gap: "12px", width: "100%" }}>
            <button
              type="button"
              className="lab-button lab-button--medium lab-button--danger-outline"
              style={{ flex: 1 }}
              onClick={cancelCatalogDetailEdit}
            >
              <span className="type-subtitle-2">Cancel</span>
            </button>
            <button
              type="button"
              className="lab-button lab-button--primary lab-button--medium"
              style={{ flex: 1 }}
              onClick={() => saveCatalogDetailEdit("Catalog updated")}
            >
              <span className="type-subtitle-2">Save Changes</span>
            </button>
          </div>
        ) : (
          <DetailPanelDeleteAction
            ariaLabel="Delete catalog"
            onDelete={() =>
              requestDeleteRow(
                "catalog",
                catalogDetailDraft.id,
                catalogDetailDraft.name
              )
            }
          />
        )}
      </aside>
    );
  }

  function renderCatalogDetailPage() {
    if (!catalogDetailDraft) {
      return (
        <section className="page-canvas page-canvas--detail">
          <DetailPageHeader
            title="Catalog Detail"
            breadcrumb="Catalog / Catalog Detail"
            onBack={closeCatalogDetailPage}
          />
          <div className="page-body">
            <EmptyState
              title="Catalog detail is not available"
              copy="Return to the catalog list and select a catalog row."
            />
          </div>
        </section>
      );
    }

    const hasInlineEditOpen = Boolean(catalogDetailEditing);
    const isEditingField = (field) =>
      catalogDetailEditing?.kind === "field" &&
      catalogDetailEditing.field === field;
    const showDetailAssignmentOverridePrice = true;
    const detailAssignmentGroupColSpan = 4;
    const editingPackageRowId =
      catalogDetailEditing?.kind === "package-row"
        ? catalogDetailEditing.rowId
        : null;
    const currentCatalogRecord = (records.catalog || []).find(
      (row) => row.id === catalogDetailDraft.id
    );
    const resolvedCurrentCatalogName =
      catalogDetailDraft.name.trim() ||
      currentCatalogRecord?.name ||
      catalogDetailDraft.name;
    const detailPackageCatalogRecords = (records.catalog || []).map((row) =>
      row.id === catalogDetailDraft.id
        ? { ...row, name: resolvedCurrentCatalogName }
        : row
    );
    const detailPackageCatalogMap = Object.fromEntries(
      detailPackageCatalogRecords.map((row) => [row.name, row])
    );
    const packageOptions = detailPackageCatalogRecords
      .map((row) => row.name)
      .filter((option) => option && option !== resolvedCurrentCatalogName);
    const detailPackageRows = catalogDetailDraft.packageItems;
    const getAvailablePackageOptions = (rowId, currentCatalogId = "") => {
      const selectedOptions = new Set(
        detailPackageRows
          .filter((row) => row.id !== rowId && row.catalogId)
          .map((row) => row.catalogId)
      );

      return packageOptions.filter(
        (option) => option === currentCatalogId || !selectedOptions.has(option)
      );
    };

    const assignmentRows = buildCatalogAssignedUnitRows(
      catalogDetailDraft.assignedUnits
    );

    return (
      <section className="page-canvas page-canvas--detail">
        <DetailPageHeader
          title="Catalog Detail"
          breadcrumb="Catalog / Catalog Detail"
          onBack={closeCatalogDetailPage}
        />
        <div className="page-body page-body--catalog-create">
          <div className="catalog-create-layout">
            <div className="catalog-create-column catalog-create-column--left">
              <section className="catalog-create-availability-card">
                <div className="catalog-availability-row">
                  <div className="catalog-availability-row__copy">
                    <p className="type-title-3">Catalog Availability</p>
                    <p className="type-body text-secondary">
                      Turn on to make this catalog available
                    </p>
                  </div>
                  <Toggle
                    checked={catalogDetailDraft.availability}
                    onChange={handleToggleCatalogDetailAvailability}
                    ariaLabel="Catalog availability"
                  />
                </div>
              </section>

              <section className="catalog-create-photo-panel">
                <div className="catalog-create-photo-panel__header">
                  <p className="type-title-2">Catalog Photo</p>
                  <p className="type-subtitle-2 text-primary">
                    {catalogDetailDraft.photos.length}/5 Photo
                  </p>
                </div>
                <input
                  ref={catalogDetailPhotoInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.heic,image/jpeg,image/png,image/heic,image/heif"
                  multiple
                  hidden
                  onChange={handleCatalogDetailPhotoUpload}
                />
                <div className="catalog-photo-grid">
                  {catalogDetailDraft.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className={`catalog-photo-card${photo.isMain ? " is-main" : ""
                        }`}
                    >
                      <button
                        type="button"
                        className="catalog-photo-card__button"
                        onClick={() =>
                          handleSetMainCatalogDetailPhoto(photo.id)
                        }
                        aria-label={`Set ${photo.name} as main photo`}
                      >
                        <span className="catalog-photo-card__media">
                          <img
                            src={photo.url}
                            alt={photo.name}
                            className="catalog-photo-card__image"
                          />
                        </span>
                      </button>
                      <button
                        type="button"
                        className="catalog-photo-card__remove"
                        aria-label={`Remove ${photo.name}`}
                        onClick={() => handleRemoveCatalogDetailPhoto(photo.id)}
                      />
                    </div>
                  ))}
                  {catalogDetailDraft.photos.length < 5 ? (
                    <button
                      type="button"
                      className="catalog-photo-placeholder"
                      onClick={() =>
                        catalogDetailPhotoInputRef.current?.click()
                      }
                      aria-label="Upload catalog photo"
                    >
                      <span className="catalog-photo-placeholder__badge">
                        <Icon
                          name="add"
                          className="lab-icon lab-icon--24"
                          alt=""
                        />
                      </span>
                    </button>
                  ) : null}
                </div>
                {catalogDetailDraft.photos.length ? (
                  <div className="catalog-photo-meta">
                    <div className="catalog-photo-info">
                      <Icon
                        name="infoBlue"
                        className="lab-icon lab-icon--16"
                        alt=""
                      />
                      <p className="type-body">
                        Click photo to set as main photo catalog
                      </p>
                    </div>
                  </div>
                ) : null}
              </section>
            </div>

            <div className="catalog-create-column catalog-create-column--right">
              <DetailSection
                title="General Information"
                className="catalog-create-form-card catalog-create-form-card--general"
                bodyClassName="catalog-general-layout"
              >
                <div className="catalog-general-row">
                  {isEditingField("type") ? (
                    <div
                      className="catalog-inline-editor"
                      data-catalog-detail-editor="true"
                    >
                      <div className="catalog-inline-editor__row">
                        <div className="catalog-inline-editor__body">
                          <CatalogTypeField
                            value={catalogDetailDraft.type}
                            onChange={handleCatalogDetailTypeSave}
                          />
                        </div>
                        <InlineEditActions
                          onCancel={cancelCatalogDetailEdit}
                          onSave={() =>
                            saveCatalogDetailEdit("Catalog type updated")
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <DetailReadField
                      label="Catalog Type"
                      value={
                        catalogDetailDraft.type === "package"
                          ? "Package"
                          : "Single Product"
                      }
                      onEdit={() =>
                        beginCatalogDetailEdit({ kind: "field", field: "type" })
                      }
                    />
                  )}
                  <DetailReadField label="" value="" ghost />
                  <DetailReadField label="" value="" ghost />
                </div>
                <div className="catalog-general-row">
                  {isEditingField("name") ? (
                    <div
                      className="catalog-inline-editor"
                      data-catalog-detail-editor="true"
                    >
                      <div className="catalog-inline-editor__row">
                        <div className="catalog-inline-editor__body">
                          <DetailField
                            label="Catalog Name"
                            required
                            value={catalogDetailDraft.name}
                            placeholder="Enter Catalog Name"
                            onChange={(value) =>
                              handleCatalogDetailChange("name", value)
                            }
                            maxLength={40}
                          />
                        </div>
                        <InlineEditActions
                          onCancel={cancelCatalogDetailEdit}
                          onSave={() =>
                            saveCatalogDetailEdit("Catalog name updated")
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <DetailReadField
                      label="Catalog Name"
                      value={catalogDetailDraft.name}
                      onEdit={() =>
                        beginCatalogDetailEdit({ kind: "field", field: "name" })
                      }
                    />
                  )}

                  {isEditingField("category") ? (
                    <div
                      className="catalog-inline-editor"
                      data-catalog-detail-editor="true"
                    >
                      <div className="catalog-inline-editor__row">
                        <div className="catalog-inline-editor__body">
                          <DetailSelectField
                            label="Category"
                            required
                            value={catalogDetailDraft.category}
                            options={catalogCategoryOptions}
                            onChange={(value) =>
                              handleCatalogDetailSingleSelectSave(
                                "category",
                                value,
                                "Category updated"
                              )
                            }
                            placeholder="Select Category"
                          />
                        </div>
                        <InlineEditActions
                          onCancel={cancelCatalogDetailEdit}
                          onSave={() =>
                            saveCatalogDetailEdit("Category updated")
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <DetailReadField
                      label="Category"
                      value={catalogDetailDraft.category}
                      onEdit={() =>
                        beginCatalogDetailEdit({
                          kind: "field",
                          field: "category",
                        })
                      }
                    />
                  )}

                  {catalogDetailDraft.type === "single" ? (
                    isEditingField("modifier") ? (
                      <div
                        className="catalog-inline-editor"
                        data-catalog-detail-editor="true"
                      >
                        <div className="catalog-inline-editor__row">
                          <div className="catalog-inline-editor__body">
                            <CatalogModifierFieldWithModal
                              label="Modifier"
                              value={catalogDetailDraft.modifier}
                              options={catalogModifierOptions}
                              onChange={(value) =>
                                handleCatalogDetailChange("modifier", value)
                              }
                              placeholder="Select Modifier"
                              ellipsis
                            />
                          </div>
                          <InlineEditActions
                            onCancel={cancelCatalogDetailEdit}
                            onSave={() =>
                              saveCatalogDetailEdit("Modifier updated")
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <DetailReadField
                        label="Modifier"
                        value={getCatalogModifierDetailValue(catalogDetailDraft.modifier)}
                        onEdit={() =>
                          beginCatalogDetailEdit({
                            kind: "field",
                            field: "modifier",
                          })
                        }
                      />
                    )
                  ) : (
                    <DetailReadField label="" value="" ghost />
                  )}
                </div>
              </DetailSection>

              {catalogDetailDraft.type === "package" ? (
                <DetailSection
                  title="Package Items"
                  className="catalog-create-form-card catalog-create-form-card--package"
                >
                  <div className="table-scroll">
                    <table className="catalog-package-table catalog-package-table--detail">
                      <thead>
                        <tr>
                          <th>
                            <p className="type-title-3">Catalog</p>
                          </th>
                          <th className="catalog-package-table__qty">
                            <p className="type-title-3">Qty</p>
                          </th>
                          <th className="catalog-package-table__price">
                            <p className="type-title-3">Nominal</p>
                          </th>
                          <th className="catalog-package-table__action" />
                        </tr>
                      </thead>
                      <tbody>
                        {detailPackageRows.map((item) => {
                          const matchedCatalog =
                            detailPackageCatalogMap[item.catalogId];
                          const itemTotal = matchedCatalog
                            ? matchedCatalog.basePrice * (Number(item.qty) || 0)
                            : 0;
                          const isBlankRow = !item.catalogId;
                          const isEditingRow = editingPackageRowId === item.id;
                          const availablePackageOptions =
                            getAvailablePackageOptions(item.id, item.catalogId);

                          if (isBlankRow) {
                            return (
                              <tr
                                key={item.id}
                                className="catalog-package-table__placeholder"
                              >
                                <td>
                                  <label className="catalog-package-field catalog-package-field--compact">
                                    <PackageItemSelectField
                                      value={item.catalogId}
                                      options={availablePackageOptions}
                                      placeholder="Select Catalog"
                                      disabled={hasInlineEditOpen}
                                      onChange={(event) =>
                                        handleCatalogDetailPackageItemChange(
                                          item.id,
                                          "catalogId",
                                          event
                                        )
                                      }
                                    />
                                  </label>
                                </td>
                                <td />
                                <td className="catalog-package-table__price" />
                                <td className="catalog-package-table__action" />
                              </tr>
                            );
                          }

                          if (isEditingRow) {
                            return (
                              <tr
                                key={item.id}
                                className="catalog-package-table__editing"
                                data-catalog-detail-editor="true"
                              >
                                <td>
                                  <label className="catalog-package-field catalog-package-field--compact">
                                    <PackageItemSelectField
                                      value={item.catalogId}
                                      options={availablePackageOptions}
                                      placeholder="Select Catalog"
                                      onChange={(event) =>
                                        handleCatalogDetailPackageItemChange(
                                          item.id,
                                          "catalogId",
                                          event
                                        )
                                      }
                                    />
                                  </label>
                                </td>
                                <td>
                                  <label className="catalog-package-field catalog-package-field--compact">
                                    <input
                                      className="type-subtitle-2"
                                      type="text"
                                      inputMode="numeric"
                                      value={item.qty}
                                      onChange={(event) =>
                                        handleCatalogDetailPackageItemChange(
                                          item.id,
                                          "qty",
                                          event.target.value
                                        )
                                      }
                                    />
                                  </label>
                                </td>
                                <td className="catalog-package-table__price">
                                  <p className="type-subtitle-2">
                                    {formatIdr(itemTotal)}
                                  </p>
                                </td>
                                <td className="catalog-package-table__action">
                                  <div className="catalog-package-table__action-group">
                                    <InlineEditActions
                                      className="catalog-inline-editor__actions--table"
                                      onCancel={cancelCatalogDetailEdit}
                                      onSave={() =>
                                        saveCatalogDetailEdit(
                                          "Package items updated"
                                        )
                                      }
                                    />
                                    <TableActionButton
                                      tooltip="Remove"
                                      onClick={() =>
                                        handleRemoveCatalogDetailPackageItem(
                                          item.id
                                        )
                                      }
                                      ariaLabel="Remove package item"
                                    >
                                      <Icon
                                        name="delete"
                                        className="lab-icon lab-icon--16"
                                        alt="Delete"
                                      />
                                    </TableActionButton>
                                  </div>
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={item.id}>
                              <td>
                                <div className="catalog-package-table__cell-copy">
                                  <p className="type-subtitle-2">
                                    {item.catalogId}
                                  </p>
                                </div>
                              </td>
                              <td>
                                <div className="catalog-package-table__cell-copy">
                                  <p className="type-subtitle-2">{item.qty}x</p>
                                </div>
                              </td>
                              <td className="catalog-package-table__price">
                                <div className="catalog-package-table__cell-copy">
                                  <p className="type-subtitle-2">
                                    {formatIdr(itemTotal)}
                                  </p>
                                </div>
                              </td>
                              <td className="catalog-package-table__action">
                                <div className="catalog-package-table__action-group">
                                  <TableActionButton
                                    tooltip="Edit"
                                    data-catalog-detail-trigger="true"
                                    onClick={() =>
                                      beginCatalogDetailEdit({
                                        kind: "package-row",
                                        rowId: item.id,
                                      })
                                    }
                                    ariaLabel="Edit package item"
                                  >
                                    <Icon
                                      name="edit"
                                      className="lab-icon lab-icon--16"
                                      alt="Edit"
                                    />
                                  </TableActionButton>
                                  <TableActionButton
                                    tooltip="Remove"
                                    disabled={hasInlineEditOpen}
                                    onClick={() =>
                                      handleRemoveCatalogDetailPackageItem(
                                        item.id
                                      )
                                    }
                                    ariaLabel="Remove package item"
                                  >
                                    <Icon
                                      name="delete"
                                      className="lab-icon lab-icon--16"
                                      alt="Delete"
                                    />
                                  </TableActionButton>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </DetailSection>
              ) : null}

              <DetailSection
                title="Pricing Configuration"
                className="catalog-create-form-card catalog-create-form-card--pricing"
                meta={
                  catalogDetailDraft.type === "package" ? (
                    <span className="catalog-detail-section__meta--summary">
                      (Catalog Total Price: {formatIdr(catalogDetailPackageTotal)})
                    </span>
                  ) : null
                }
              >
                <div className="catalog-pricing-row">
                  <DetailReadField
                    label="Default Price"
                    value={formatIdr(Number(catalogDetailDraft.price || 0))}
                  />
                  {selectedSidebarBusinessUnit ? (
                    isEditingField("overridePrice") ? (
                      <div
                        className="catalog-inline-editor"
                        data-catalog-detail-editor="true"
                      >
                        <div className="catalog-inline-editor__row">
                          <div className="catalog-inline-editor__body">
                            <PriceField
                              value={catalogDetailDraft.overridePrice}
                              onChange={(value) =>
                                handleCatalogDetailChange("overridePrice", value)
                              }
                            />
                          </div>
                          <InlineEditActions
                            onCancel={cancelCatalogDetailEdit}
                            onSave={() =>
                              saveCatalogDetailEdit("Override Price updated")
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <DetailReadField
                        label="Override Price"
                        value={formatIdr(Number(catalogDetailDraft.overridePrice || 0))}
                        onEdit={() =>
                          beginCatalogDetailEdit({
                            kind: "field",
                            field: "overridePrice",
                          })
                        }
                      />
                    )
                  ) : null}

                  {isEditingField("allowOverridePrice") ? (
                    <div
                      className="catalog-inline-editor"
                      data-catalog-detail-editor="true"
                    >
                      <div className="catalog-inline-editor__row">
                        <div className="catalog-inline-editor__body catalog-inline-editor__body--toggle">
                          <div className="catalog-toggle-field">
                            <span className="catalog-detail-field__label type-body">
                              Allow Override Price
                            </span>
                            <div className="catalog-toggle-field__control">
                              <Toggle
                                checked={catalogDetailDraft.allowOverridePrice}
                                onChange={() =>
                                  handleCatalogDetailChange(
                                    "allowOverridePrice",
                                    !catalogDetailDraft.allowOverridePrice
                                  )
                                }
                                ariaLabel="Allow override price"
                              />
                            </div>
                          </div>
                        </div>
                        <InlineEditActions
                          className="catalog-inline-editor__actions--toggle"
                          onCancel={cancelCatalogDetailEdit}
                          onSave={() =>
                            saveCatalogDetailEdit("Override price updated")
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <DetailReadField
                      label="Allow Override Price"
                      value={
                        catalogDetailDraft.allowOverridePrice
                          ? "Allowed"
                          : "Not Allowed"
                      }
                      onEdit={() =>
                        beginCatalogDetailEdit({
                          kind: "field",
                          field: "allowOverridePrice",
                        })
                      }
                    />
                  )}
                </div>
              </DetailSection>

              <DetailSection
                title="Entity Assignment"
                className="catalog-create-form-card catalog-create-form-card--units"
                bodyClassName="catalog-assignment-layout"
                meta={
                  catalogDetailDraft.assignedUnits.length ? (
                    <LabButton
                      label="Assign"
                      variant="primary"
                      size="small"
                      icon="add"
                      disabled={hasInlineEditOpen}
                      onClick={() => openUnitAssignmentModal("detail")}
                    />
                  ) : null
                }
              >
                <div className="catalog-assignment-section">
                  {catalogDetailDraft.assignedUnits.length ? (
                    <>
                      <div className="catalog-assignment-info">
                        <Icon
                          name="infoBlue"
                          className="lab-icon lab-icon--18"
                          alt=""
                        />
                        <p className="type-body">
                          Price override settings for each entity are
                          managed in Pricing Rule menu
                        </p>
                      </div>
                      <div className="catalog-assignment-table-wrap table-scroll">
                        <table className="catalog-assignment-table">
                          <thead>
                            <tr>
                              <th>
                                <p className="type-title-3">Entity</p>
                              </th>
                              <th className="catalog-assignment-table__value">
                                <p className="type-title-3">Maximum</p>
                              </th>
                              {showDetailAssignmentOverridePrice ? (
                                <th className="catalog-assignment-table__value catalog-assignment-table__value--override">
                                  <p className="type-title-3">Override Price</p>
                                </th>
                              ) : null}
                              <th className="catalog-assignment-table__action" />
                            </tr>
                          </thead>
                          <tbody>
                            {assignmentRows.map((row) => {
                              if (row.type === "group") {
                                return (
                                  <tr
                                    key={row.id}
                                    className="catalog-assignment-table__group-row"
                                  >
                                    <td colSpan={detailAssignmentGroupColSpan}>
                                      <div className="catalog-assignment-table__group-label">
                                        <p className="type-subtitle-2">
                                          {row.label}
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }

                              return (
                                <tr key={row.id}>
                                  <td>
                                    <div className="catalog-assignment-table__cell-button">
                                      <div className="lab-table__cell-stack">
                                        <p className="type-subtitle-2">
                                          {row.name}
                                        </p>
                                        {row.subtitle ? (
                                          <p className="lab-table__cell-subtitle type-body text-secondary">
                                            {row.subtitle}
                                          </p>
                                        ) : null}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="catalog-assignment-table__value">
                                    <div className="catalog-assignment-table__cell-button">
                                      <p className="type-subtitle-2">
                                        {row.maxOverridePrice}
                                      </p>
                                    </div>
                                  </td>
                                  {showDetailAssignmentOverridePrice ? (
                                    <td className="catalog-assignment-table__value catalog-assignment-table__value--override">
                                      <div className="catalog-assignment-table__cell-button">
                                        <p className="type-subtitle-2">
                                          {row.overridePrice}
                                        </p>
                                      </div>
                                    </td>
                                  ) : null}
                                  <td className="catalog-assignment-table__action">
                                    <button
                                      type="button"
                                      className="catalog-assignment-remove"
                                      disabled={hasInlineEditOpen}
                                      aria-label={`Remove ${row.name}`}
                                      onClick={() =>
                                        handleRemoveCatalogDetailAssignedUnit(
                                          row.id
                                        )
                                      }
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="catalog-assignment-empty">
                      <p className="catalog-assignment-empty__title type-title-2">
                        Not Assigned Yet
                      </p>
                      <p className="catalog-assignment-empty__copy type-body">
                        Assign this catalog to an entity so it can be used
                      </p>
                      <LabButton
                        label="Assign"
                        variant="primary"
                        size="small"
                        icon="add"
                        disabled={hasInlineEditOpen}
                        onClick={() => openUnitAssignmentModal("detail")}
                      />
                    </div>
                  )}
                </div>
              </DetailSection>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderCatalogPage() {
    const filteredRows = getCatalogRows();
    const paged = getPagedRows("catalog", filteredRows);
    const detailView = getCatalogDetailViewModel();
    const isDetailPanelOpen = Boolean(detailView);
    const isCreatePanelOpen = currentPage === "catalog-create";
    const allVisibleSelected =
      filteredRows.length > 0 &&
      filteredRows.every((row) => selectedRows.catalog.includes(row.id));

    return (
      <CatalogModule
        isDetailOpen={isDetailPanelOpen}
        isCreateOpen={isCreatePanelOpen}
        lockedInfoBox={renderLockedBusinessUnitInfoBox()}
        pageHeader={
          <PageHeader
            title={topNavbarContext?.title}
            actionLabel={topNavbarContext?.actionLabel}
            onAction={topNavbarContext?.onAction}
          />
        }
        sidePanel={
          isCreatePanelOpen
            ? renderCatalogCreateSidePanel()
            : isDetailPanelOpen
              ? renderCatalogDetailSidePanel(detailView)
              : null
        }
      >
        <CatalogListPage
          totalRows={filteredRows.length}
          displayTotal={records.catalog?.length ?? 0}
          filters={[
            <FilterChip
              key="category"
              label="Category"
              values={filtersByPage.catalog.category}
              options={catalogCategoryFilterOptions}
              onChange={(value) => handleSetFilter("catalog", "category", value)}
            />,
          ]}
          searchValue={searchByPage.catalog}
          onSearch={(value) => handleSetSearch("catalog", value)}
          onTableScroll={handleTableCardScroll}
          allVisibleSelected={allVisibleSelected}
          onToggleAll={() => handleToggleAllRows("catalog", filteredRows)}
          sortKey={sortByPage.catalog}
          sortDirection={sortDirectionByPage.catalog}
          onSort={(value) => handleSetSort("catalog", value)}
          rows={(() => {
            const categoryParentPaths = new Map(
              categoryRows
                .filter((r) => r.parentCategory)
                .map((r) => {
                  const parts = (r.hierarchyPath || r.name || "").split(CATEGORY_HIERARCHY_SEPARATOR);
                  return [r.name, parts.slice(0, -1).join(CATEGORY_HIERARCHY_SEPARATOR)];
                })
            );
            return paged.rows.map((row) => {
              const base = row.id === catalogDetailDraft?.id
                ? { ...row, availability: catalogDetailDraft.availability }
                : row;
              const categoryParentPath = categoryParentPaths.get(row.category) || "";
              return categoryParentPath ? { ...base, categoryParentPath } : base;
            });
          })()}
          selectedCatalogId={catalogDetailDraft?.id ?? null}
          selectedRowIds={selectedRows.catalog}
          onToggleSelectedRow={(rowId) => handleToggleSelectedRow("catalog", rowId)}
          onOpenDetail={openCatalogDetailPage}
          onToggleAvailability={handleToggleCatalogAvailability}
          onRequestDelete={(row) => requestDeleteRow("catalog", row.id, row.name)}
          page={paged.page}
          totalPages={paged.totalPages}
          rowsPerPage={rowsPerPage.catalog}
          onRowsChange={(value) => handleSetRowsPerPage("catalog", value)}
          onPrev={() => handlePaginate("catalog", "prev")}
          onNext={() => handlePaginate("catalog", "next")}
          onSelectPage={(value) => handleGoToPage("catalog", value)}
          onDownload={() => handleDownloadPage("catalog")}
          formatIdr={formatIdr}
        />
      </CatalogModule>
    );
  }

  function renderCategoryDetailSidePanel(categoryRow) {
    if (!categoryRow || !categoryDetailDraft) return null;

    const detailContext = getCategoryDetailContext(categoryRow, categoryDetailDraft);
    if (!detailContext) return null;

    const {
      connectedCatalogNames,
      effectiveCategoryRow,
      parentOptions: categoryDetailParentOptions,
    } = detailContext;

    const isEditing = categoryDetailEditing?.kind === "all";

    return (
      <aside className="catalog-detail-side-panel catalog-detail-panel">
        <div className="catalog-detail-panel__header">
          <div className="catalog-detail-panel__titlebar">
            <p className="catalog-detail-panel__title type-title-2">
              {effectiveCategoryRow.name}
            </p>
            <div className="catalog-detail-panel__actions">
              {!isEditing && (
                <button
                  type="button"
                  className="lab-button lab-button--small lab-button--secondary"
                  onClick={() => beginCategoryDetailEdit({ kind: "all" })}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Icon name="edit" className="lab-icon lab-icon--16" alt="" />
                  <span className="type-subtitle-2">Edit</span>
                </button>
              )}
              <button
                type="button"
                className="catalog-detail-panel__close"
                onClick={closeCategoryDetailPanel}
                aria-label="Close category detail"
              >
                <Icon
                  name="panelClose"
                  className="lab-icon lab-icon--16"
                  alt="Close"
                />
              </button>
            </div>
          </div>
        </div>
        <div className="catalog-detail-panel__body">
          <DetailSection title="General Information">
            <div
              className="catalog-panel-info-list"
              data-category-detail-editor={isEditing ? "true" : undefined}
            >
              {isEditing ? (
                <>
                  <DetailField
                    label="Category Name"
                    required
                    value={categoryDetailDraft.name}
                    placeholder="Enter Category Name"
                    onChange={(value) => handleCategoryDetailChange("name", value)}
                    error={categoryDetailErrors.name}
                    maxLength={40}
                    autoFocus
                    disabled={effectiveCategoryRow.isDefault}
                    ellipsis
                  />
                  <DetailSelectField
                    label="Parent Category"
                    value={categoryDetailDraft.parentCategory}
                    options={categoryDetailParentOptions}
                    onChange={(value) => handleCategoryDetailChange("parentCategory", value)}
                    placeholder="None (Main Category)"
                    disabled={effectiveCategoryRow.isDefault}
                    hideChevron={effectiveCategoryRow.isDefault}
                    valueColor={effectiveCategoryRow.isDefault ? "var(--neutral-on-surface-secondary)" : undefined}
                    ellipsis
                  />

                  {(!categoryDetailDraft.parentCategory || categoryDetailDraft.parentCategory === "None (Main Category)") && (
                    <CategoryColorPicker
                      value={categoryDetailDraft.color}
                      onChange={(value) => handleCategoryDetailChange("color", value)}
                    />
                  )}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <DetailField
                      label="Hierarchy"
                      value={effectiveCategoryRow.hierarchyPath || effectiveCategoryRow.name}
                      disabled
                      ellipsis
                    />
                  </div>


                </>
              ) : (
                <>
                  <CatalogPanelInfoRow
                    label="Category Name"
                    value={effectiveCategoryRow.name}
                  />
                  <CatalogPanelInfoRow
                    label="Parent Category"
                    value={effectiveCategoryRow.parentCategory || "Main Category"}
                    ellipsis
                  />
                  {!effectiveCategoryRow.parentCategory && (
                    <CatalogPanelInfoRow
                      label="Category Color"
                      value={
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "4px",
                            backgroundColor: categoryDetailDraft.color,
                          }}
                        />
                      }
                    />
                  )}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <CatalogPanelInfoRow
                      label="Hierarchy"
                      value={effectiveCategoryRow.hierarchyPath || effectiveCategoryRow.name}
                      disabled
                    />
                  </div>

                </>
              )}
            </div>
          </DetailSection>
          <DetailSection
            title="Connected Catalog"
            meta={`${connectedCatalogNames.length} Catalog${connectedCatalogNames.length === 1 ? "" : "s"
              }`}
          >
            <div className="catalog-panel-info-list catalog-panel-info-list--single-column">
              <CatalogPanelInfoRow
                label="Catalog"
                value={
                  connectedCatalogNames.length
                    ? connectedCatalogNames.join(", ")
                    : "-"
                }
                disabled
              />
            </div>
          </DetailSection>
        </div>
        {isEditing ? (
          <div className="catalog-detail-panel__footer" style={{ display: "flex", gap: "12px", width: "100%" }}>
            <button
              type="button"
              className="lab-button lab-button--medium lab-button--danger-outline"
              style={{ flex: 1 }}
              onClick={cancelCategoryDetailEdit}
            >
              <span className="type-subtitle-2">Cancel</span>
            </button>
            <button
              type="button"
              className="lab-button lab-button--primary lab-button--medium"
              style={{ flex: 1 }}
              onClick={() => saveCategoryDetailEdit("Category updated")}
            >
              <span className="type-subtitle-2">Save Changes</span>
            </button>
          </div>
        ) : (
          <DetailPanelDeleteAction
            ariaLabel="Delete category"
            onDelete={() => requestDeleteRow("category", categoryRow.id, categoryRow.name)}
          />
        )}
      </aside>
    );
  }

  function renderUnitDetailSidePanel(unitRow) {
    if (!unitRow || !unitDetailDraft) return null;

    const effectiveUnitName = unitDetailDraft.name.trim() || unitRow.name;
    const connectedCatalogNames = getConnectedCatalogNamesForUnit(
      effectiveUnitName,
      records.catalog
    );

    const isEditing = unitDetailEditing?.kind === "all";

    return (
      <aside className="catalog-detail-side-panel catalog-detail-panel">
        <div className="catalog-detail-panel__header">
          <div className="catalog-detail-panel__titlebar">
            <p className="catalog-detail-panel__title type-title-2">
              {effectiveUnitName}
            </p>
            <div className="catalog-detail-panel__actions">
              {!isEditing && (
                <button
                  type="button"
                  className="lab-button lab-button--small lab-button--secondary"
                  onClick={() => beginUnitDetailEdit({ kind: "all" })}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Icon name="edit" className="lab-icon lab-icon--16" alt="" />
                  <span className="type-subtitle-2">Edit</span>
                </button>
              )}
              <button
                type="button"
                className="catalog-detail-panel__close"
                onClick={closeUnitDetailPanel}
                aria-label="Close unit detail"
              >
                <Icon
                  name="panelClose"
                  className="lab-icon lab-icon--16"
                  alt="Close"
                />
              </button>
            </div>
          </div>
        </div>
        <div className="catalog-detail-panel__body">
          <DetailSection title="General Information">
            <div
              className="catalog-panel-info-list"
              data-unit-detail-editor={isEditing ? "true" : undefined}
            >
              {isEditing ? (
                <>
                  <DetailField
                    label="Unit Name"
                    required
                    value={unitDetailDraft.name}
                    placeholder="Enter Unit Name"
                    onChange={(value) => handleUnitDetailChange("name", value)}
                    error={unitDetailErrors.name}
                    maxLength={40}
                    autoFocus
                  />
                  <DetailSelectField
                    label="Precision"
                    value={unitDetailDraft.precision}
                    options={UNIT_PRECISION_OPTIONS}
                    onChange={(value) => handleUnitDetailChange("precision", value)}
                    placeholder="Select Precision"
                  />
                </>
              ) : (
                <>
                  <CatalogPanelInfoRow
                    label="Unit Name"
                    value={effectiveUnitName}
                  />
                  <CatalogPanelInfoRow
                    label="Precision"
                    value={normalizeUnitPrecisionOption(unitDetailDraft.precision)}
                  />
                </>
              )}
            </div>
          </DetailSection>
          <DetailSection
            title="Connected Catalog"
            meta={`${connectedCatalogNames.length} Catalog${connectedCatalogNames.length === 1 ? "" : "s"
              }`}
          >
            <div className="catalog-panel-info-list catalog-panel-info-list--single-column">
              <CatalogPanelInfoRow
                label="Catalog"
                value={
                  connectedCatalogNames.length
                    ? connectedCatalogNames.join(", ")
                    : "-"
                }
                disabled
              />
            </div>
          </DetailSection>
        </div>
        {isEditing ? (
          <div className="catalog-detail-panel__footer" style={{ display: "flex", gap: "12px", width: "100%" }}>
            <button
              type="button"
              className="lab-button lab-button--medium lab-button--danger-outline"
              style={{ flex: 1 }}
              onClick={cancelUnitDetailEdit}
            >
              <span className="type-subtitle-2">Cancel</span>
            </button>
            <button
              type="button"
              className="lab-button lab-button--primary lab-button--medium"
              style={{ flex: 1 }}
              onClick={() => saveUnitDetailEdit("Unit updated")}
            >
              <span className="type-subtitle-2">Save Changes</span>
            </button>
          </div>
        ) : (
          <DetailPanelDeleteAction
            ariaLabel="Delete unit"
            onDelete={() => requestDeleteRow("unit", unitRow.id, unitRow.name)}
          />
        )}
      </aside>
    );
  }

  function renderSellingTimeDetailSidePanel(sellingTimeRow) {
    if (!sellingTimeRow || !sellingTimeDetailDraft) return null;

    const isEditingField = (field) =>
      sellingTimeDetailEditing?.kind === "field" &&
      sellingTimeDetailEditing.field === field;
    const editingSchedule =
      sellingTimeDetailEditing?.kind === "schedule-day"
        ? sellingTimeDetailEditing
        : null;
    const effectiveSellingTimeName =
      sellingTimeDetailDraft.name.trim() || sellingTimeRow.name || "-";
    const getDaySlotError = (dayId, slotId, key) =>
      Boolean(
        sellingTimeDetailErrors[getSellingTimeSlotErrorKey(dayId, slotId, key)]
      );
    const scheduleRows = (sellingTimeDetailDraft.days ?? []).flatMap((day) => {
      const visibleSlots = day.enabled
        ? day.slots.length
          ? day.slots
          : [createSellingTimeSlot("", "")]
        : [day.slots?.[0] ?? createSellingTimeSlot("", "")];

      return visibleSlots.map((slot, index) => ({
        id: slot.id ?? `${day.id}-slot-${index + 1}`,
        day,
        slot,
        isFirstRow: index === 0,
        isLastRow: index === visibleSlots.length - 1,
        isEditingDay: editingSchedule?.dayId === day.id,
        rowSpan: visibleSlots.length,
      }));
    });

    return (
      <aside className="catalog-detail-side-panel catalog-detail-panel">
        <div className="catalog-detail-panel__header">
          <div className="catalog-detail-panel__titlebar">
            <p className="catalog-detail-panel__title type-title-2">
              {effectiveSellingTimeName}
            </p>
            <div className="catalog-detail-panel__actions">
              <button
                type="button"
                className="catalog-detail-panel__close"
                onClick={closeSellingTimeDetailPanel}
                aria-label="Close selling time detail"
              >
                <Icon
                  name="panelClose"
                  className="lab-icon lab-icon--16"
                  alt="Close"
                />
              </button>
            </div>
          </div>
        </div>
        <div className="catalog-detail-panel__body">
          <DetailSection title="General Information">
            <div className="catalog-panel-info-list">
              {isEditingField("name") ? (
                <div
                  className="catalog-inline-editor"
                  data-selling-time-detail-editor="true"
                >
                  <div className="catalog-inline-editor__row">
                    <div className="catalog-inline-editor__body">
                      <DetailField
                        label="Selling Time Name"
                        required
                        value={sellingTimeDetailDraft.name}
                        placeholder="Enter Selling Time Name"
                        onChange={(value) =>
                          handleSellingTimeDetailChange("name", value)
                        }
                      />
                    </div>
                    <InlineEditActions
                      onCancel={cancelSellingTimeDetailEdit}
                      onSave={() =>
                        saveSellingTimeDetailEdit("Selling time updated")
                      }
                    />
                  </div>
                </div>
              ) : (
                <CatalogPanelInfoRow
                  label="Selling Time Name"
                  value={effectiveSellingTimeName}
                  onEdit={() =>
                    beginSellingTimeDetailEdit({
                      kind: "field",
                      field: "name",
                    })
                  }
                  triggerDataAttr="data-selling-time-detail-trigger"
                />
              )}
            </div>
          </DetailSection>
          <DetailSection title="Selling Time Configuration">
            <div
              className="table-scroll catalog-detail-panel__table-scroll selling-time-detail-table-wrap"
              data-scroll-left="false"
              data-scroll-right="false"
              onScroll={handleCatalogDetailPanelTableScroll}
            >
              <table className="selling-time-schedule-table selling-time-detail-table">
                <thead>
                  <tr>
                    <th className="selling-time-detail-table__day-column">
                      <div className="selling-time-schedule-table__header-copy selling-time-schedule-table__header-copy--day">
                        <p className="type-title-3">Day</p>
                      </div>
                    </th>
                    <th className="selling-time-detail-table__status-column">
                      <div className="selling-time-schedule-table__header-copy">
                        <p className="type-title-3">24 Hours</p>
                      </div>
                    </th>
                    <th className="selling-time-detail-table__time-column">
                      <div className="selling-time-schedule-table__header-copy">
                        <p className="type-title-3">Start Receiving Time</p>
                      </div>
                    </th>
                    <th className="selling-time-detail-table__time-column">
                      <div className="selling-time-schedule-table__header-copy">
                        <p className="type-title-3">End Receiving Time</p>
                      </div>
                    </th>
                    <th className="selling-time-detail-table__button-column">
                      <div className="selling-time-schedule-table__header-copy">
                        <p className="type-title-3">Add Time</p>
                      </div>
                    </th>
                    <th className="selling-time-detail-table__icon-column selling-time-detail-table__icon-column--actions" />
                    <th className="selling-time-detail-table__icon-column" />
                  </tr>
                </thead>
                <tbody>
                  {scheduleRows.map((entry) => {
                    const {
                      day,
                      slot,
                      isFirstRow,
                      isLastRow,
                      isEditingDay,
                      rowSpan,
                    } = entry;
                    const hasSingleSlot = (day.slots?.length ?? 0) <= 1;
                    const startError = getDaySlotError(
                      day.id,
                      slot.id,
                      "start"
                    );
                    const endError = getDaySlotError(day.id, slot.id, "end");

                    return (
                      <tr
                        key={entry.id}
                        data-selling-time-detail-editor={
                          isEditingDay ? "true" : undefined
                        }
                      >
                        {isFirstRow ? (
                          <>
                            <td
                              rowSpan={rowSpan}
                              className="selling-time-schedule-table__day-cell selling-time-detail-table__day-cell"
                            >
                              <div
                                className="selling-time-schedule-table__day-stack selling-time-detail-table__day-stack"
                                data-selling-time-detail-editor={
                                  isEditingDay ? "true" : undefined
                                }
                              >
                                <Toggle
                                  checked={day.enabled}
                                  onChange={
                                    isEditingDay
                                      ? () =>
                                        handleToggleSellingTimeDetailDay(
                                          day.id
                                        )
                                      : () => { }
                                  }
                                  ariaLabel={`${day.label} enabled`}
                                />
                                <p className="selling-time-schedule-table__day-label type-subtitle-2">
                                  {day.label}
                                </p>
                              </div>
                            </td>
                            <td
                              rowSpan={rowSpan}
                              className="selling-time-detail-table__status-cell"
                            >
                              {isEditingDay ? (
                                <div className="selling-time-detail-table__status-content">
                                  <label
                                    className="selling-time-schedule-table__twenty-four selling-time-detail-table__twenty-four"
                                    data-selling-time-detail-editor="true"
                                  >
                                    <LabCheckbox
                                      checked={day.is24Hours}
                                      onChange={() =>
                                        handleSellingTimeDetailToggle24Hours(
                                          day.id
                                        )
                                      }
                                      disabled={!day.enabled}
                                      ariaLabel={`Set ${day.label} to 24 hours`}
                                    />
                                    <p className="type-subtitle-2">Yes</p>
                                  </label>
                                </div>
                              ) : (
                                <div className="selling-time-detail-table__status-content">
                                  <p className="type-subtitle-2">
                                    {day.enabled
                                      ? day.is24Hours
                                        ? "Yes"
                                        : "No"
                                      : ""}
                                  </p>
                                </div>
                              )}
                            </td>
                          </>
                        ) : null}
                        <td className="selling-time-detail-table__value-cell">
                          {isEditingDay ? (
                            <div className="selling-time-detail-table__field-stack">
                              <SellingTimeTimeField
                                value={day.enabled ? slot?.start || "" : ""}
                                disabled={!day.enabled || day.is24Hours}
                                error={startError}
                                onChange={(value) =>
                                  handleSellingTimeDetailSlotChange(
                                    day.id,
                                    slot.id,
                                    "start",
                                    value
                                  )
                                }
                              />
                              {startError ? (
                                <p className="selling-time-detail-table__field-error type-body">
                                  Field cannot be empty
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <p className="type-subtitle-2">
                              {day.enabled ? slot?.start || "00:00" : ""}
                            </p>
                          )}
                        </td>
                        <td className="selling-time-detail-table__value-cell">
                          {isEditingDay ? (
                            <div className="selling-time-detail-table__field-stack">
                              <SellingTimeTimeField
                                value={
                                  day.enabled
                                    ? day.is24Hours
                                      ? "23:59"
                                      : slot?.end || ""
                                    : ""
                                }
                                disabled={!day.enabled || day.is24Hours}
                                error={endError}
                                onChange={(value) =>
                                  handleSellingTimeDetailSlotChange(
                                    day.id,
                                    slot.id,
                                    "end",
                                    value
                                  )
                                }
                              />
                              {endError ? (
                                <p className="selling-time-detail-table__field-error type-body">
                                  Field cannot be empty
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <p className="type-subtitle-2">
                              {day.enabled
                                ? day.is24Hours
                                  ? "23:59"
                                  : slot?.end || "00:00"
                                : ""}
                            </p>
                          )}
                        </td>
                        <td className="selling-time-detail-table__button-cell">
                          {isLastRow ? (
                            <button
                              type="button"
                              className="selling-time-schedule-table__add-button type-subtitle-2"
                              data-selling-time-detail-trigger="true"
                              disabled={!day.enabled || day.is24Hours}
                              onClick={() =>
                                isEditingDay
                                  ? handleAddSellingTimeDetailSlot(day.id)
                                  : beginSellingTimeDetailEdit({
                                    kind: "schedule-day",
                                    dayId: day.id,
                                  })
                              }
                            >
                              Add Time
                            </button>
                          ) : null}
                        </td>
                        <td className="selling-time-detail-table__icon-cell selling-time-detail-table__icon-cell--actions">
                          {isEditingDay && isLastRow ? (
                            <InlineEditActions
                              className="catalog-inline-editor__actions--table"
                              onCancel={cancelSellingTimeDetailEdit}
                              onSave={() =>
                                saveSellingTimeDetailEdit(
                                  "Selling time updated"
                                )
                              }
                            />
                          ) : !isEditingDay ? (
                            <TableActionButton
                              tooltip="Edit"
                              data-selling-time-detail-trigger="true"
                              onClick={() =>
                                beginSellingTimeDetailEdit({
                                  kind: "schedule-day",
                                  dayId: day.id,
                                })
                              }
                              ariaLabel={`Edit ${day.label}`}
                            >
                              <Icon
                                name="edit"
                                className="lab-icon lab-icon--16"
                                alt="Edit"
                              />
                            </TableActionButton>
                          ) : null}
                        </td>
                        <td className="selling-time-detail-table__icon-cell selling-time-detail-table__icon-cell--delete">
                          {day.enabled ? (
                            <TableActionButton
                              tooltip="Delete"
                              data-selling-time-detail-trigger="true"
                              disabled={hasSingleSlot}
                              onClick={() =>
                                handleRemoveSellingTimeDetailSlot(
                                  day.id,
                                  slot.id
                                )
                              }
                              ariaLabel={`Delete ${day.label} time`}
                            >
                              <Icon
                                name="delete"
                                className="lab-icon lab-icon--16"
                                alt="Delete"
                              />
                            </TableActionButton>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DetailSection>
        </div>
        <DetailPanelDeleteAction
          ariaLabel="Delete selling time"
          onDelete={() =>
            requestDeleteRow(
              "selling-time",
              sellingTimeRow.id,
              sellingTimeRow.name
            )
          }
        />
      </aside>
    );
  }

  function renderModifierDetailSidePanel(modifierRow) {
    if (!modifierRow || !modifierDetailDraft) return null;
    const showEntityAssignmentTab = !selectedSidebarBusinessUnit;
    const activeModifierDetailTab = showEntityAssignmentTab
      ? modifierDetailPanelTab
      : "general";
    const isEditing = modifierDetailEditing?.kind === "all";
    const effectiveModifierName =
      modifierDetailDraft.name.trim() || modifierRow.name || "-";
    const modifierOptions = modifierDetailDraft.options ?? [];
    const visibleModifierOptions = isEditing
      ? modifierOptions
      : modifierOptions.filter((option) => option?.name?.trim?.());
    const connectedCatalogNames = Array.isArray(
      modifierDetailDraft.connectedCatalog
    )
      ? modifierDetailDraft.connectedCatalog.filter(Boolean)
      : [];
    const connectedCatalogValue = getModifierConnectedCatalogSummary(
      connectedCatalogNames
    );
    const assignedUnits = modifierDetailDraft.assignedUnits ?? [];
    const assignmentRows = buildCatalogAssignedUnitRows(assignedUnits);
    const modifierColumns = getModifierUnitAssignmentColumns(
      modifierDetailDraft.options
    );
    const showModifierOverrideAdditionalPrice = Boolean(
      selectedSidebarBusinessUnit
    );

    return (
      <aside className="catalog-detail-side-panel catalog-detail-panel">
        <div className="catalog-detail-panel__header">
          <div className="catalog-detail-panel__titlebar">
            <p className="catalog-detail-panel__title type-title-2">
              {effectiveModifierName}
            </p>
            <div className="catalog-detail-panel__actions">
              {!isEditing && (
                <button
                  type="button"
                  className="lab-button lab-button--small lab-button--secondary"
                  onClick={() => beginModifierDetailEdit({ kind: "all" })}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Icon name="edit" className="lab-icon lab-icon--16" alt="" />
                  <span className="type-subtitle-2">Edit</span>
                </button>
              )}
              <button
                type="button"
                className="catalog-detail-panel__close"
                onClick={closeModifierDetailPanel}
                aria-label="Close modifier detail"
              >
                <Icon
                  name="panelClose"
                  className="lab-icon lab-icon--16"
                  alt="Close"
                />
              </button>
            </div>
          </div>
          {showEntityAssignmentTab ? (
            <div className="catalog-detail-panel__tabbar">
              <div className="catalog-detail-panel__tabs" role="tablist">
                <button
                  type="button"
                  className={`catalog-detail-panel__tab${activeModifierDetailTab === "general" ? " is-active" : ""
                    }`}
                  onClick={() => setModifierDetailPanelTab("general")}
                  role="tab"
                  aria-selected={activeModifierDetailTab === "general"}
                >
                  General
                </button>
                <button
                  type="button"
                  className={`catalog-detail-panel__tab${activeModifierDetailTab === "unit-assignment"
                    ? " is-active"
                    : ""
                    }`}
                  onClick={() => setModifierDetailPanelTab("unit-assignment")}
                  role="tab"
                  aria-selected={activeModifierDetailTab === "unit-assignment"}
                >
                  Entity Assignment
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="catalog-detail-panel__body">
          {activeModifierDetailTab === "general" ? (
            <>
              <section className="catalog-create-form-card catalog-detail-section">
                <div className="catalog-availability-row">
                  <div className="catalog-availability-row__copy">
                    <p className="catalog-panel-availability__title type-title-3">
                      Modifier Availability
                    </p>
                    <p className="type-body text-secondary">
                      Turn on to make this modifier available
                    </p>
                  </div>
                  <Toggle
                    checked={modifierDetailDraft.availability !== false}
                    onChange={
                      !isLockedSelectedBusinessUnit
                        ? handleToggleModifierDetailAvailability
                        : undefined
                    }
                    disabled={isLockedSelectedBusinessUnit}
                    ariaLabel="Modifier availability"
                  />
                </div>
              </section>
              <DetailSection title="General Information">
                <div
                  className="catalog-panel-info-list"
                  data-modifier-detail-editor={isEditing ? "true" : undefined}
                >
                  {isEditing ? (
                    <>
                      <div className="catalog-panel-info-list--single-column">
                        <DetailField
                          label="Modifier Name"
                          required
                          value={modifierDetailDraft.name}
                          placeholder="Enter Modifier Name"
                          onChange={(value) =>
                            handleModifierDetailChange("name", value)
                          }
                          error={modifierDetailErrors.name}
                          maxLength={40}
                          ellipsis
                        />
                      </div>

                      <div className="modifier-create-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                          <DetailField
                            label="Minimum Selection"
                            value={modifierDetailDraft.minimumSelection}
                            placeholder="0"
                            inputMode="numeric"
                            onChange={(value) =>
                              handleModifierDetailChange(
                                "minimumSelection",
                                value
                              )
                            }
                            ellipsis
                          />
                          <p className="catalog-detail-inline-hint type-body text-secondary">
                            If &gt; 0, required
                          </p>
                        </div>
                        <div>
                          <DetailField
                            label="Maximum Selection"
                            value={modifierDetailDraft.maximumSelection}
                            placeholder="0"
                            inputMode="numeric"
                            onChange={(value) =>
                              handleModifierDetailChange(
                                "maximumSelection",
                                value
                              )
                            }
                            ellipsis
                          />
                          <p className="catalog-detail-inline-hint type-body text-secondary">
                            Limit Selection
                          </p>
                        </div>
                      </div>
                      {modifierDetailErrors.selectionRange && (
                        <p className="modifier-option-table__field-error type-body" style={{ gridColumn: "1 / -1", width: "100%", marginTop: "4px" }}>
                          {modifierDetailErrors.selectionRange}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <CatalogPanelInfoRow
                        label="Modifier Name"
                        value={effectiveModifierName}
                        ellipsis
                      />

                      <div className="modifier-create-row">
                        <CatalogPanelInfoRow
                          label="Minimum Selection"
                          value={modifierDetailDraft.minimumSelection || "0"}
                          helper="(If > 0, required)"
                          ellipsis
                        />
                        <CatalogPanelInfoRow
                          label="Maximum Selection"
                          value={modifierDetailDraft.maximumSelection || "0"}
                          helper="(Limit Selection)"
                          ellipsis
                        />
                      </div>
                    </>
                  )}
                </div>
              </DetailSection>
              <DetailSection title="Modifier Options">
                {Number(modifierDetailDraft.minimumSelection) > 0 && (
                  <div className="catalog-assignment-info" style={{ marginBottom: "8px", justifyContent: "flex-start", alignItems: "flex-start" }}>
                    <Icon name="infoBlue" className="lab-icon lab-icon--18" alt="" />
                    <p className="type-body">
                      At least {modifierDetailDraft.minimumSelection} option must be active to enable this modifier
                    </p>
                  </div>
                )}
                <ModifierOptionsTable
                  options={visibleModifierOptions}
                  isEditing={isEditing}
                  showAvailabilityInEditing
                  minimumSelection={modifierDetailDraft.minimumSelection}
                  dragOverOptionId={modifierDragOverOptionId}
                  optionNameErrors={modifierDetailErrors.optionNames ?? []}
                  optionIngredientQtyErrors={
                    modifierDetailErrors.optionIngredientQtys ?? []
                  }
                  ingredientOptions={MODIFIER_INGREDIENT_OPTION_LABELS}
                  onOptionChange={(optionId, key, value) => {
                    if (key === "isAvailable" && !value) {
                      const activeCount = (modifierDetailDraft.options || []).filter(
                        (opt) => opt.id !== optionId && opt.isAvailable !== false
                      ).length;
                      if (activeCount === 0 && Number(modifierDetailDraft.minimumSelection) > 0) {
                        setModifierOptionDeactivateConfirm({ optionId });
                        return;
                      }
                    }
                    handleModifierDetailOptionChange(optionId, key, value);
                  }}
                  onRemoveOption={handleRemoveModifierDetailOption}
                  onAddOption={handleAddModifierDetailOption}
                  onDragStart={handleModifierDetailOptionDragStart}
                  onDragEnd={handleModifierDetailOptionDragEnd}
                  onDragOver={handleModifierDetailOptionDragOver}
                  onDrop={handleModifierDetailOptionDrop}
                  addButtonDisabled={isLockedSelectedBusinessUnit}
                  addButtonDataAttribute="data-modifier-detail-trigger"
                  rowDataAttribute={isEditing ? "data-modifier-detail-editor" : undefined}
                  emptyReadonlyContent={
                    <div className="modifier-detail-options-empty">
                      <p className="type-body text-secondary">
                        No modifier options added yet.
                      </p>
                    </div>
                  }
                />
                {modifierDetailErrors.selectionCount && (
                  <p className="modifier-option-table__field-error type-body" style={{ marginTop: "4px" }}>
                    {modifierDetailErrors.selectionCount}
                  </p>
                )}
                {modifierDetailErrors.defaultSelection && (
                  <p className="modifier-option-table__field-error type-body" style={{ marginTop: "4px" }}>
                    {modifierDetailErrors.defaultSelection}
                  </p>
                )}
              </DetailSection>

              <DetailSection title="Connected Catalog">
                {isEditing ? (
                  <div className="catalog-panel-info-list catalog-panel-info-list--single-column">
                    <ModifierCatalogModalField
                      label="Catalog List"
                      value={modifierDetailDraft.connectedCatalog}
                      groups={modifierCatalogGroups}
                      onClick={() => openModifierCatalogModal("modifier-detail", modifierDetailDraft.connectedCatalog)}
                      placeholder="Select Catalog"
                      ellipsis
                    />
                  </div>
                ) : (
                  <div className="catalog-panel-info-list catalog-panel-info-list--single-column">
                    <CatalogPanelInfoRow
                      label="Catalog List"
                      value={connectedCatalogValue}
                    />
                  </div>
                )}
              </DetailSection>
            </>
          ) : (
            <DetailSection
              title="Entity Assignment"
              className="catalog-create-form-card"
              bodyClassName="catalog-assignment-layout"
              meta={
                isEditing && assignedUnits.length ? (
                  <LabButton
                    label="Assign"
                    variant="primary"
                    size="small"
                    icon="add"
                    disabled={isLockedSelectedBusinessUnit}
                    onClick={() => openUnitAssignmentModal("modifier-detail")}
                  />
                ) : null
              }
            >
              <div className="catalog-assignment-section">
                {assignedUnits.length ? (
                  <>
                    <div className="catalog-assignment-info">
                      <Icon
                        name="infoBlue"
                        className="lab-icon lab-icon--18"
                        alt=""
                      />
                      <p className="type-body">
                        Price override settings for each entity are
                        managed in Pricing Rule menu
                      </p>
                    </div>
                    <div
                      className="catalog-assignment-table-wrap table-scroll catalog-detail-panel__table-scroll catalog-detail-panel__table-scroll--assignment"
                      data-scroll-left="false"
                      data-scroll-right="false"
                      onScroll={handleCatalogDetailPanelTableScroll}
                    >
                      <table className="catalog-assignment-table catalog-assignment-table--panel modifier-unit-assignment-table">
                        <thead>
                          <tr>
                            <th className="modifier-unit-assignment-table__business">
                              <p className="type-title-3">Entity</p>
                            </th>

                            {modifierColumns.map((column) => (
                              <th
                                key={column.id}
                                className="modifier-unit-assignment-table__modifier"
                              >
                                <p className="type-title-3">{column.name}</p>
                              </th>
                            ))}
                            <th className="modifier-unit-assignment-table__action" />
                          </tr>
                        </thead>
                        <tbody>
                          {assignmentRows.map((row) => (
                            <tr key={row.id}>
                              <td className="modifier-unit-assignment-table__business">
                                <div className="catalog-assignment-table__cell-button">
                                  <div className="lab-table__cell-stack">
                                    <p className="type-subtitle-2">
                                      {row.name}
                                    </p>
                                    {row.subtitle ? (
                                      <p className="lab-table__cell-subtitle type-body text-secondary">
                                        {row.subtitle}
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                              </td>

                              {modifierColumns.map((column) => (
                                <td
                                  key={`${row.id}-${column.id}`}
                                  className="modifier-unit-assignment-table__modifier"
                                >
                                  <div className="catalog-assignment-table__cell-button">
                                    <p className="type-subtitle-2">
                                      {getModifierDetailUnitAssignmentValue(
                                        column,
                                        row
                                      )}
                                    </p>
                                  </div>
                                </td>
                              ))}
                              <td className="modifier-unit-assignment-table__action catalog-assignment-table__action">
                                <button
                                  type="button"
                                  className="catalog-assignment-remove"
                                  disabled={!isEditing || isLockedSelectedBusinessUnit}
                                  aria-label={`Remove ${row.name}`}
                                  onClick={() =>
                                    handleRemoveModifierDetailAssignedUnit(
                                      row.id
                                    )
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="catalog-assignment-empty">
                    <p className="catalog-assignment-empty__title type-title-2">
                      Not Assigned Yet
                    </p>
                    <p className="catalog-assignment-empty__copy type-body">
                      Assign this modifier to an entity so it can be used
                    </p>
                    {isEditing ? (
                      <LabButton
                        label="Assign"
                        variant="primary"
                        size="small"
                        icon="add"
                        disabled={isLockedSelectedBusinessUnit}
                        onClick={() => openUnitAssignmentModal("modifier-detail")}
                      />
                    ) : null}
                  </div>
                )}
              </div>
            </DetailSection>
          )}
        </div>
        {isEditing ? (
          <div className="catalog-detail-panel__footer" style={{ display: "flex", gap: "12px", width: "100%" }}>
            <button
              type="button"
              className="lab-button lab-button--medium lab-button--danger-outline"
              style={{ flex: 1 }}
              onClick={cancelModifierDetailEdit}
            >
              <span className="type-subtitle-2">Cancel</span>
            </button>
            <button
              type="button"
              className="lab-button lab-button--primary lab-button--medium"
              style={{ flex: 1 }}
              onClick={() => saveModifierDetailEdit("Modifier updated")}
            >
              <span className="type-subtitle-2">Save Changes</span>
            </button>
          </div>
        ) : (
          <DetailPanelDeleteAction
            ariaLabel="Delete modifier"
            onDelete={() =>
              requestDeleteRow("modifier", modifierRow.id, modifierRow.name)
            }
          />
        )}
      </aside>
    );
  }

  function renderPricingRuleDetailSidePanel(ruleRow) {
    if (!ruleRow || !pricingRuleDetailDraft) return null;

    const isEditing = pricingRuleDetailEditing?.kind === "all";
    const renderPricingRuleParts = (parts, keyPrefix) =>
      parts.length
        ? parts.map((part, index) => (
          <span
            key={`${keyPrefix}-${index}`}
            className={part.muted ? "text-secondary" : undefined}
          >
            {part.text}
          </span>
        ))
        : "-";
    const effectiveRuleName =
      pricingRuleDetailDraft.name.trim() || ruleRow.name || "-";
    const catalogGroups =
      pricingRuleDetailDraft.overrides?.catalog ??
      createPricingOverrideSections().catalog;
    const modifierGroups =
      pricingRuleDetailDraft.overrides?.modifier ??
      createPricingOverrideSections().modifier;

    return (
      <aside
        className={`catalog-detail-side-panel catalog-detail-panel${pricingRuleDetailPanelTab === "catalog-price" ||
          pricingRuleDetailPanelTab === "modifier-price"
          ? " catalog-detail-panel--special-pricing-rule"
          : ""
          }`}
      >
        <div className="catalog-detail-panel__header">
          <div className="catalog-detail-panel__titlebar">
            <p className="catalog-detail-panel__title type-title-2">
              {effectiveRuleName}
            </p>
            <div className="catalog-detail-panel__actions">
              {!isEditing && (
                <button
                  type="button"
                  className="lab-button lab-button--small lab-button--secondary"
                  onClick={() => beginPricingRuleDetailEdit({ kind: "all" })}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Icon name="edit" className="lab-icon lab-icon--16" alt="" />
                  <span className="type-subtitle-2">Edit</span>
                </button>
              )}
              <button
                type="button"
                className="catalog-detail-panel__close"
                onClick={closePricingRuleDetailPanel}
                aria-label="Close special pricing rule detail"
              >
                <Icon
                  name="panelClose"
                  className="lab-icon lab-icon--16"
                  alt="Close"
                />
              </button>
            </div>
          </div>
          <div className="catalog-detail-panel__tabbar">
            <div className="catalog-detail-panel__tabs" role="tablist">
              <button
                type="button"
                className={`catalog-detail-panel__tab${pricingRuleDetailPanelTab === "general" ? " is-active" : ""
                  }`}
                onClick={() => setPricingRuleDetailPanelTab("general")}
              >
                General
              </button>
              <button
                type="button"
                className={`catalog-detail-panel__tab${pricingRuleDetailPanelTab === "catalog-price"
                  ? " is-active"
                  : ""
                  }`}
                onClick={() => setPricingRuleDetailPanelTab("catalog-price")}
              >
                Catalog Price
              </button>
              <button
                type="button"
                className={`catalog-detail-panel__tab${pricingRuleDetailPanelTab === "modifier-price"
                  ? " is-active"
                  : ""
                  }`}
                onClick={() => setPricingRuleDetailPanelTab("modifier-price")}
              >
                Modifier Price
              </button>
            </div>
          </div>
        </div>
        <div className="catalog-detail-panel__body">
          {pricingRuleDetailPanelTab === "general" ? (
            <DetailSection title="General Information">
              <div
                className="catalog-panel-info-list"
                data-pricing-rule-detail-editor={isEditing ? "true" : undefined}
              >
                {isEditing ? (
                  <>
                    <DetailField
                      label="Rule Name"
                      required
                      value={pricingRuleDetailDraft.name}
                      placeholder="Enter Rule Name"
                      onChange={(value) =>
                        handlePricingRuleDetailChange("name", value)
                      }
                      error={pricingRuleDetailErrors.name}
                    />
                    <PricingRuleDateField
                      label="Start Date"
                      value={pricingRuleDetailDraft.startDate}
                      placeholder="Select Start Date"
                      onChange={(value) =>
                        handlePricingRuleDetailChange("startDate", value)
                      }
                    />
                    <PricingRuleDateField
                      label="End Date"
                      value={pricingRuleDetailDraft.endDate}
                      placeholder="Select End Date"
                      onChange={(value) =>
                        handlePricingRuleDetailChange("endDate", value)
                      }
                    />
                  </>
                ) : (
                  <>
                    <CatalogPanelInfoRow
                      label="Rule Name"
                      value={effectiveRuleName}
                    />
                    <CatalogPanelInfoRow
                      label="Start Date"
                      value={renderPricingRuleParts(
                        getPricingRuleDateDisplayParts(
                          pricingRuleDetailDraft.startDate
                        ),
                        `${pricingRuleDetailDraft.id}-start-date`
                      )}
                    />
                    <CatalogPanelInfoRow
                      label="End Date"
                      value={renderPricingRuleParts(
                        getPricingRuleDateDisplayParts(
                          pricingRuleDetailDraft.endDate
                        ),
                        `${pricingRuleDetailDraft.id}-end-date`
                      )}
                    />
                  </>
                )}
              </div>
            </DetailSection>
          ) : pricingRuleDetailPanelTab === "catalog-price" ? (
            <DetailSection title="Catalog Override Rules">
              <PricingRuleDetailOverrideTable
                sectionKey="catalog"
                groups={catalogGroups}
                isEditing={isEditing}
                onChangeMaximum={handlePricingRuleDetailMaximumChange}
              />
            </DetailSection>
          ) : (
            <DetailSection title="Modifier Override Rules">
              <PricingRuleDetailOverrideTable
                sectionKey="modifier"
                groups={modifierGroups}
                isEditing={isEditing}
                onChangeMaximum={handlePricingRuleDetailMaximumChange}
              />
            </DetailSection>
          )}
        </div>
        {isEditing ? (
          <div className="catalog-detail-panel__footer" style={{ display: "flex", gap: "12px", width: "100%" }}>
            <button
              type="button"
              className="lab-button lab-button--medium lab-button--danger-outline"
              style={{ flex: 1 }}
              onClick={cancelPricingRuleDetailEdit}
            >
              <span className="type-subtitle-2">Cancel</span>
            </button>
            <button
              type="button"
              className="lab-button lab-button--primary lab-button--medium"
              style={{ flex: 1 }}
              onClick={() =>
                savePricingRuleDetailEdit("Special pricing rule updated")
              }
            >
              <span className="type-subtitle-2">Save Changes</span>
            </button>
          </div>
        ) : (
          <DetailPanelDeleteAction
            ariaLabel="Delete special pricing rule"
            onDelete={() =>
              requestDeleteRow(
                "pricing-rule",
                ruleRow.id,
                ruleRow.name
              )
            }
          />
        )}
      </aside>
    );
  }

  function renderPricingRulePage() {
    const filteredRows = getRowsForPage("pricing-rule");
    const paged = getPagedRows("pricing-rule", filteredRows);
    const allVisibleSelected =
      filteredRows.length > 0 &&
      filteredRows.every((row) =>
        selectedRows["pricing-rule"].includes(row.id)
      );

    const catalogOverrideGroups = pricingOverridesBySection.catalog;
    const modifierOverrideGroups = pricingOverridesBySection.modifier;
    const isSpecialRuleDetailOpen =
      pricingRuleTab === "special" && Boolean(selectedPricingRuleDetailRow);
    const isCreatePanelOpen = currentPage === "pricing-rule-create";

    return (
      <PricingRuleModule
        isSpecialRuleTab={pricingRuleTab === "special"}
        isDetailOpen={isSpecialRuleDetailOpen}
        isCreateOpen={isCreatePanelOpen}
        lockedInfoBox={renderLockedBusinessUnitInfoBox()}
        pageHeader={
          <PageHeader
            title={topNavbarContext?.title}
            actionLabel={topNavbarContext?.actionLabel}
            onAction={topNavbarContext?.onAction}
          />
        }
        sidePanel={
          isCreatePanelOpen
            ? renderPricingRuleCreateSidePanel()
            : isSpecialRuleDetailOpen
              ? renderPricingRuleDetailSidePanel(selectedPricingRuleDetailRow)
              : null
        }
      >
        <PricingRuleListPage
          PricingRuleTabButtonComponent={PricingRuleTabButton}
          PricingOverrideCardComponent={PricingOverrideCard}
          pricingRuleTab={pricingRuleTab}
          onSetPricingRuleTab={handleSetPricingRuleTab}
          catalogOverrideGroups={catalogOverrideGroups}
          modifierOverrideGroups={modifierOverrideGroups}
          selectedPricingOverrides={selectedPricingOverrides}
          onToggleAllCatalogOverrides={() =>
            handleToggleAllPricingOverrides("catalog", catalogOverrideGroups)
          }
          onToggleCatalogOverrideGroup={(group) =>
            handleTogglePricingOverrideGroup("catalog", group)
          }
          onToggleCatalogOverrideItem={(itemId) =>
            handleTogglePricingOverrideItem("catalog", itemId)
          }
          catalogPricingOverrideEditing={
            pricingOverrideEditing?.sectionKey === "catalog"
              ? pricingOverrideEditing
              : null
          }
          onStartCatalogPricingOverrideEdit={(itemId) =>
            handleStartPricingOverrideEdit("catalog", itemId)
          }
          onChangePricingOverrideEdit={handleChangePricingOverrideEdit}
          onSavePricingOverrideEdit={handleSavePricingOverrideEdit}
          onCancelPricingOverrideEdit={handleCancelPricingOverrideEdit}
          onToggleAllModifierOverrides={() =>
            handleToggleAllPricingOverrides("modifier", modifierOverrideGroups)
          }
          onToggleModifierOverrideGroup={(group) =>
            handleTogglePricingOverrideGroup("modifier", group)
          }
          onToggleModifierOverrideItem={(itemId) =>
            handleTogglePricingOverrideItem("modifier", itemId)
          }
          modifierPricingOverrideEditing={
            pricingOverrideEditing?.sectionKey === "modifier"
              ? pricingOverrideEditing
              : null
          }
          onStartModifierPricingOverrideEdit={(itemId) =>
            handleStartPricingOverrideEdit("modifier", itemId)
          }
          pricingOverrideInputRef={pricingOverrideInputRef}
          totalRows={filteredRows.length}
          searchValue={searchByPage["pricing-rule"]}
          onSearch={(value) => handleSetSearch("pricing-rule", value)}
          onTableScroll={handleTableCardScroll}
          allVisibleSelected={allVisibleSelected}
          onToggleAllRows={() =>
            handleToggleAllRows("pricing-rule", filteredRows)
          }
          rows={paged.rows}
          selectedPricingRuleId={selectedPricingRuleDetailRow?.id ?? null}
          selectedRowIds={selectedRows["pricing-rule"]}
          onToggleSelectedRow={(rowId) =>
            handleToggleSelectedRow("pricing-rule", rowId)
          }
          onOpenDetail={openPricingRuleDetailPanel}
          onRequestDelete={(row) =>
            requestDeleteRow("pricing-rule", row.id, row.name)
          }
          page={paged.page}
          totalPages={paged.totalPages}
          rowsPerPage={rowsPerPage["pricing-rule"]}
          onRowsChange={(value) => handleSetRowsPerPage("pricing-rule", value)}
          onPrev={() => handlePaginate("pricing-rule", "prev")}
          onNext={() => handlePaginate("pricing-rule", "next")}
          onSelectPage={(value) => handleGoToPage("pricing-rule", value)}
        />
      </PricingRuleModule>
    );
  }

  function renderGenericListPage(pageId, customTable = null) {
    const config = PAGE_CONFIGS[pageId];
    const allRows = records[pageId] ?? [];
    const filteredRows = getRowsForPage(pageId);
    const paged = getPagedRows(pageId, filteredRows);
    const summaryCount = filteredRows.length;
    const isCategoryPage = pageId === "category";
    const isUnitPage = pageId === "unit";
    const isModifierPage = pageId === "modifier";
    const isSellingTimePage = pageId === "selling-time";
    const isDeviceManagementPage = pageId === "device-management";
    const isGroupedDevicePage = pageId === "grouped-device";
    const isRoleAccessPage = pageId === "role-access";
    const isCategoryCreateOpen = isCategoryPage && currentPage === "category-create";
    const isUnitCreateOpen = isUnitPage && currentPage === "unit-create";
    const isModifierCreateOpen = isModifierPage && currentPage === "modifier-create";
    const isSellingTimeCreateOpen =
      isSellingTimePage && currentPage === "selling-time-create";
    const isDeviceManagementCreateOpen =
      isDeviceManagementPage && currentPage === "device-management-create";
    const isGroupedDeviceCreateOpen =
      isGroupedDevicePage && currentPage === "grouped-device-create";
    const isRoleAccessCreateOpen =
      isRoleAccessPage &&
      (currentPage === "role-management-create" ||
        currentPage === "role-access-create");
    const isSplitDetailPage =
      isCategoryPage ||
      isUnitPage ||
      isModifierPage ||
      isSellingTimePage ||
      isDeviceManagementPage ||
      isGroupedDevicePage ||
      isRoleAccessPage;
    const isDetailPanelOpen = isCategoryPage
      ? Boolean(selectedCategoryDetailRow)
      : isUnitPage
        ? Boolean(selectedUnitDetailRow)
        : isModifierPage
          ? Boolean(selectedModifierDetailRow)
          : isSellingTimePage
            ? Boolean(selectedSellingTimeDetailRow)
            : isDeviceManagementPage
              ? Boolean(selectedDeviceManagementDetailRow)
              : isGroupedDevicePage
                ? Boolean(selectedGroupedDeviceDetailRow)
                : isRoleAccessPage
                  ? Boolean(roleAccessDetailId)
                  : false;
    const allVisibleSelected =
      filteredRows.length > 0 &&
      filteredRows.every((row) => selectedRows[pageId].includes(row.id));
    const titleColumnKey =
      config.columns.find((column) => column.type === "link")?.key ?? null;
    const toolbarFilters = (config.filters || []).map((filter) =>
      filter.mode === "multi" ? (
        <FilterChip
          key={filter.key}
          label={filter.label}
          values={filtersByPage[pageId][filter.key]}
          options={getFilterOptions(pageId, filter.key, filter.options)}
          onChange={(value) => handleSetFilter(pageId, filter.key, value)}
        />
      ) : (
        <SingleFilterChip
          key={filter.key}
          value={filtersByPage[pageId][filter.key]}
          options={getFilterOptions(pageId, filter.key, filter.options)}
          onChange={(value) => handleSetFilter(pageId, filter.key, value)}
        />
      )
    );
    return (
      <section
        className={
          isSplitDetailPage
            ? `page-canvas catalog-page-shell${isDetailPanelOpen ||
              isCategoryCreateOpen ||
              isUnitCreateOpen ||
              isModifierCreateOpen ||
              isSellingTimeCreateOpen ||
              isDeviceManagementCreateOpen ||
              isGroupedDeviceCreateOpen ||
              isRoleAccessCreateOpen
              ? " is-detail-open"
              : ""
            }`
            : "page-canvas"
        }
      >
        <div className={isSplitDetailPage ? "catalog-page-main" : undefined}>
          <PageHeader
            title={topNavbarContext?.title}
            actionLabel={topNavbarContext?.actionLabel}
            onAction={topNavbarContext?.onAction}
          />
          <div className="page-body page-body--list">
            {renderLockedBusinessUnitInfoBox()}
            <section
              className={`table-card list-page-table-card${isDeviceManagementPage
                ? " list-page-table-card--device-management"
                : ""
                }`}
              data-page-id={pageId}
            >
              <ListPageToolbar
                totalRows={summaryCount}
                totalLabel={config.summaryLabel ?? config.title}
                filters={toolbarFilters}
                searchPlaceholder={config.searchPlaceholder}
                searchValue={searchByPage[pageId]}
                onSearch={(value) => handleSetSearch(pageId, value)}
              />
              {isGroupedDevicePage ? (
                <div className="grouped-device-info-banner">
                  {!hasKdsDevices ? (
                    <div className="lab-infobox lab-infobox--orange">
                      <Icon
                        name="infoBlue"
                        className="lab-icon lab-icon--20 grouped-device-info-banner__icon"
                        alt=""
                        color="var(--status-orange-primary)"
                      />
                      <div className="lab-infobox__copy grouped-device-empty-banner__copy">
                        <p className="type-body grouped-device-empty-banner__message">
                          <span className="grouped-device-empty-banner__title">
                            No KDS device available.
                          </span>{" "}
                          <span>
                            All catalog items cannot be sent to any kitchen display because no
                            Kitchen Display System (KDS) device exists.
                          </span>
                        </p>
                      </div>
                    </div>
                  ) : !hasGroupedDeviceGroups ? (
                    <div className="lab-infobox lab-infobox--blue">
                      <Icon
                        name="infoBlue"
                        className="lab-icon lab-icon--20 grouped-device-info-banner__icon"
                        alt=""
                        color="var(--feature-brand-primary)"
                      />
                      <div className="lab-infobox__copy grouped-device-empty-banner__copy">
                        <p className="type-body grouped-device-empty-banner__message">
                          <span className="grouped-device-empty-banner__title">
                            No KDS group configured yet.
                          </span>{" "}
                          <span>
                            All catalog items will be sent to all Kitchen Display System (KDS)
                            devices until you create a KDS group.
                          </span>
                        </p>
                      </div>
                    </div>
                  ) : groupedDeviceUnassignedCatalogCount > 0 ? (
                    <div className="lab-infobox lab-infobox--orange">
                      <Icon
                        name="infoBlue"
                        className="lab-icon lab-icon--20 grouped-device-info-banner__icon"
                        alt=""
                        color="var(--status-orange-primary)"
                      />
                      <div className="lab-infobox__copy grouped-device-unrouted-banner__copy">
                        <p className="type-body grouped-device-unrouted-banner__message">
                          <span className="grouped-device-unrouted-banner__count">
                            {groupedDeviceUnassignedCatalogCount} unrouted catalog
                          </span>
                          <span>
                            cannot be sent to the kitchen.
                          </span>
                        </p>
                        <button
                          type="button"
                          className="lab-button grouped-device-unrouted-banner__button"
                          onClick={() => setIsUnroutedCatalogModalOpen(true)}
                        >
                          View Detail
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div
                className="table-scroll"
                data-scroll-top="false"
                onScroll={handleTableCardScroll}
              >
                {customTable ? (
                  customTable
                ) : (
                  <table
                    className={`lab-table${pageId === "unit" || pageId === "modifier" ? " is-layout-fixed" : ""
                      }${pageId === "device-management" ? " is-device-management" : ""}`}
                  >
                    <thead>
                      <tr>
                        <th className="lab-table__checkbox">
                          <LabCheckbox
                            checked={allVisibleSelected}
                            onChange={() =>
                              handleToggleAllRows(pageId, filteredRows)
                            }
                            ariaLabel={`Select all ${config.title} rows`}
                          />
                        </th>
                        {config.columns.map((column) => {
                          const isTitleColumn = column.key === titleColumnKey;
                          const headerClassName =
                            column.type === "delete"
                              ? "lab-table__action"
                              : [
                                column.thClassName,
                                isTitleColumn ? "lab-table__title-column" : "",
                              ]
                                .filter(Boolean)
                                .join(" ") || undefined;

                          return (
                            <th
                              key={column.key}
                              className={headerClassName}
                              style={column.width ? { width: column.width } : undefined}
                            >
                              {column.label ? (
                                column.sortable ? (
                                  <span className="lab-table__header-stack">
                                    <button
                                      type="button"
                                      className="lab-table__header-button"
                                      onClick={() => handleSetSort(pageId, column.key)}
                                    >
                                      <p className={`type-title-3${column.key === "addedByName" ? " text-primary" : ""}`}>{column.label}</p>
                                    </button>
                                    <ChevronIcon
                                      name="filterChevron"
                                      size={16}
                                      color="#C2C2C2"
                                      direction={
                                        sortByPage[pageId] === column.key
                                          ? (sortDirectionByPage[pageId] === "asc" ? "up" : "down")
                                          : "down"
                                      }
                                    />
                                  </span>
                                ) : (
                                  <p className={`type-title-3${column.key === "addedByName" ? " text-primary" : ""}`}>{column.label}</p>
                                )
                              ) : null}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {paged.rows.length ? (
                        paged.rows.map((row) => (
                          <tr
                            key={row.id}
                            className={
                              isSplitDetailPage
                                ? `lab-table__row--clickable${(
                                  isCategoryPage
                                    ? categoryDetailId === row.id
                                    : isUnitPage
                                      ? unitDetailId === row.id
                                      : isModifierPage
                                        ? modifierDetailId === row.id
                                        : isSellingTimePage
                                          ? sellingTimeDetailId === row.id
                                          : isDeviceManagementPage
                                            ? deviceManagementDetailId === row.id
                                            : isGroupedDevicePage
                                              ? groupedDeviceDetailId === row.id
                                              : isRoleAccessPage
                                                ? roleAccessDetailId === row.id
                                                : false
                                )
                                  ? " lab-table__row--selected"
                                  : ""
                                }`
                                : undefined
                            }
                            tabIndex={isSplitDetailPage ? 0 : undefined}
                            onClick={
                              isCategoryPage
                                ? () => openCategoryDetailPanel(row.id)
                                : isUnitPage
                                  ? () => openUnitDetailPanel(row.id)
                                  : isModifierPage
                                    ? () => openModifierDetailPanel(row.id)
                                    : isSellingTimePage
                                      ? () => openSellingTimeDetailPanel(row.id)
                                      : isDeviceManagementPage
                                        ? () => openDeviceManagementDetailPanel(row.id)
                                        : isGroupedDevicePage
                                          ? () => openGroupedDeviceDetailPanel(row)
                                          : isRoleAccessPage
                                            ? () => openRoleAccessDetailPanel(row.id)
                                            : undefined
                            }
                            onKeyDown={
                              isSplitDetailPage
                                ? (event) => {
                                  if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                  ) {
                                    event.preventDefault();
                                    if (isCategoryPage) {
                                      openCategoryDetailPanel(row.id);
                                    } else if (isUnitPage) {
                                      openUnitDetailPanel(row.id);
                                    } else if (isModifierPage) {
                                      openModifierDetailPanel(row.id);
                                    } else if (isSellingTimePage) {
                                      openSellingTimeDetailPanel(row.id);
                                    } else if (isDeviceManagementPage) {
                                      openDeviceManagementDetailPanel(row.id);
                                    } else if (isGroupedDevicePage) {
                                      openGroupedDeviceDetailPanel(row);
                                    } else if (isRoleAccessPage) {
                                      openRoleAccessDetailPanel(row.id);
                                    }
                                  }
                                }
                                : undefined
                            }
                          >
                            <td
                              className="lab-table__checkbox"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <LabCheckbox
                                checked={selectedRows[pageId].includes(row.id)}
                                onChange={() =>
                                  handleToggleSelectedRow(pageId, row.id)
                                }
                                ariaLabel={`Select ${row.name}`}
                              />
                            </td>
                            {config.columns.map((column) => {
                              const isTitleColumn = column.key === titleColumnKey;
                              const cellClassName =
                                [
                                  column.tdClassName,
                                  isTitleColumn ? "lab-table__title-cell" : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ") || undefined;
                              const cellStyle =
                                column.width ? { width: column.width } : undefined;
                              const cellValue =
                                isDeviceManagementPage && column.key === "deviceConnected"
                                  ? (row.deviceType === "Printer" ? row.deviceConnected : getDeviceConnectedDisplayValue(row))
                                  : row[column.key] || "-";

                              if (column.type === "delete") {
                                const isPrinterDevice = row.deviceType === "Printer";
                                const isDisconnectedDevice = row.status === "Disconnected";
                                const isPendingDevice = row.status === "Pending";
                                const isExpiredDevice = row.status === "Expired";
                                const isPrimaryPowerAction =
                                  isDisconnectedDevice || isExpiredDevice;
                                const powerTooltip = isPrinterDevice
                                  ? "Unavailable for printers"
                                  : isExpiredDevice
                                    ? "Regenerate"
                                    : isDisconnectedDevice
                                      ? "Turn On"
                                      : isPendingDevice
                                        ? "Turn Off"
                                        : "Disconnect";
                                const powerAriaLabel = isPrinterDevice
                                  ? "Unavailable for printers"
                                  : isExpiredDevice
                                    ? "Regenerate pairing code"
                                    : isDisconnectedDevice
                                      ? "Turn on device connection"
                                      : isPendingDevice
                                        ? "Turn off device connection"
                                        : "Disconnect device";

                                return (
                                  <td
                                    key={column.key}
                                    className="lab-table__action"
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    <div className="lab-table__action-group">
                                      {isDeviceManagementPage ? (
                                        <TableActionButton
                                          tooltip={powerTooltip}
                                          className={`table-row-action ${isPrimaryPowerAction
                                            ? "table-row-action--primary"
                                            : "table-row-action--danger"
                                            }`}
                                          disabled={isPrinterDevice}
                                          onClick={() => {
                                            if (isPrinterDevice) {
                                              return;
                                            }

                                            if (isExpiredDevice) {
                                              handleStartDevicePendingPairing(
                                                row,
                                                Boolean(row.isReconnectFromDisconnect)
                                              );
                                              return;
                                            }

                                            if (isDisconnectedDevice) {
                                              requestDeviceStatusChange(row, "Connected");
                                              return;
                                            }

                                            requestDeviceStatusChange(
                                              row,
                                              "Disconnected",
                                              isPendingDevice
                                                ? { disconnectLabel: "Turn Off Connection" }
                                                : undefined
                                            );
                                          }}
                                          ariaLabel={powerAriaLabel}
                                        >
                                          <Icon
                                            name="power"
                                            className="lab-icon lab-icon--16"
                                            alt=""
                                            color={
                                              isPrinterDevice
                                                ? "var(--neutral-on-surface-tertiary)"
                                                : isPrimaryPowerAction
                                                  ? "var(--feature-brand-primary)"
                                                  : "var(--status-red-primary)"
                                            }
                                          />
                                        </TableActionButton>
                                      ) : null}
                                      <TableActionButton
                                        tooltip={
                                          row.deviceType === "Printer"
                                            ? "Delete unavailable for printers"
                                            : row.isDefault
                                              ? "Cannot delete default item"
                                              : "Delete"
                                        }
                                        disabled={row.deviceType === "Printer" || row.isDefault}
                                        onClick={() => {
                                          if (row.deviceType === "Printer" || row.isDefault) {
                                            return;
                                          }

                                          requestDeleteRow(
                                            pageId,
                                            row.id,
                                            row.deviceName ??
                                            row.name ??
                                            row.label ??
                                            row.title ??
                                            row.id
                                          );
                                        }}
                                      >
                                        <Icon
                                          name="delete"
                                          className="lab-icon lab-icon--16"
                                          alt="Delete"
                                        />
                                      </TableActionButton>
                                    </div>
                                  </td>
                                );
                              }

                              if (column.type === "status") {
                                return (
                                  <td
                                    key={column.key}
                                    className={cellClassName}
                                    style={cellStyle}
                                  >
                                    <StatusPill status={row[column.key]} />
                                  </td>
                                );
                              }

                              if (column.type === "component") {
                                return (
                                  <td
                                    key={column.key}
                                    className={cellClassName}
                                    style={cellStyle}
                                    onClick={isSplitDetailPage ? (event) => event.stopPropagation() : undefined}
                                    onMouseDown={isSplitDetailPage ? (event) => event.stopPropagation() : undefined}
                                    onPointerDown={isSplitDetailPage ? (event) => event.stopPropagation() : undefined}
                                  >
                                    {cellValue}
                                  </td>
                                );
                              }

                              if (column.type === "link") {
                                const cellValueToRender = cellValue;
                                const isRoleAccessNameColumn = isRoleAccessPage && column.key === "name";
                                const roleTypeBadge = isRoleAccessNameColumn && row.type === "System" ? (
                                  <span
                                    className="status-pill status-pill--primary"
                                    style={{ flex: "none", verticalAlign: "middle" }}
                                  >
                                    <span className="type-body">System</span>
                                  </span>
                                ) : null;

                                return (
                                  <td
                                    key={column.key}
                                    className={cellClassName}
                                    style={cellStyle}
                                  >
                                    <div className="lab-table__cell-stack">
                                      <p
                                        className="type-subtitle-2 lab-table__link"
                                        style={
                                          column.key === "addedByName"
                                            ? {
                                              color:
                                                "var(--neutral-on-surface-primary)",
                                            }
                                            : {}
                                        }
                                      >
                                        {isRoleAccessNameColumn ? (
                                          <span
                                            style={{
                                              display: "inline-flex",
                                              alignItems: "center",
                                              gap: "4px",
                                              maxWidth: "100%",
                                              minWidth: 0,
                                              verticalAlign: "middle",
                                            }}
                                          >
                                            <span
                                              style={{
                                                display: "block",
                                                flex: "1 1 auto",
                                                minWidth: 0,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                verticalAlign: "middle",
                                              }}
                                            >
                                              {cellValueToRender}
                                            </span>
                                            {roleTypeBadge}
                                          </span>
                                        ) : (
                                          cellValueToRender
                                        )}
                                      </p>
                                      {column.subtitleKey &&
                                        row[column.subtitleKey] ? (
                                        <p className="lab-table__cell-subtitle type-body text-secondary">
                                          {row[column.subtitleKey]}
                                        </p>
                                      ) : null}
                                    </div>
                                  </td>
                                );
                              }

                              return (
                                <td
                                  key={column.key}
                                  className={cellClassName}
                                  style={cellStyle}
                                >
                                  <p
                                    className={`type-subtitle-2${column.contentClassName
                                      ? ` ${column.contentClassName}`
                                      : ""
                                      }`}
                                  >
                                    {cellValue}
                                  </p>
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      ) : allRows.length === 0 ? (
                        <tr>
                          <td colSpan={config.columns.length + 1}>
                            <EmptyDataState menuName={config.title} />
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={config.columns.length + 1}>
                            <EmptyState
                              title={Boolean(searchByPage[pageId]?.trim())
                                ? `No ${config.title.toLowerCase()} matches your search`
                                : `No ${config.title.toLowerCase()} matches the current filters`
                              }
                              copy={Boolean(searchByPage[pageId]?.trim())
                                ? "Try using different keywords or adjusting your filters"
                                : "Try adjusting or clearing the filters"
                              }
                            />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
              <TableFooterBar
                page={paged.page}
                totalPages={paged.totalPages}
                rowsPerPage={rowsPerPage[pageId]}
                totalRows={filteredRows.length}
                onRowsChange={(value) => handleSetRowsPerPage(pageId, value)}
                onPrev={() => handlePaginate(pageId, "prev")}
                onNext={() => handlePaginate(pageId, "next")}
                onSelectPage={(value) => handleGoToPage(pageId, value)}
                onDownload={() => handleDownloadPage(pageId)}
              />
            </section>
          </div>
        </div>
        {isCategoryCreateOpen
          ? renderCategoryCreateSidePanel()
          : isCategoryPage && isDetailPanelOpen
            ? renderCategoryDetailSidePanel(selectedCategoryDetailRow)
            : null}
        {isUnitCreateOpen
          ? renderUnitCreateSidePanel()
          : isUnitPage && isDetailPanelOpen
            ? renderUnitDetailSidePanel(selectedUnitDetailRow)
            : null}
        {isModifierCreateOpen
          ? renderModifierCreateSidePanel()
          : isModifierPage && isDetailPanelOpen
            ? renderModifierDetailSidePanel(selectedModifierDetailRow)
            : null}
        {isSellingTimeCreateOpen
          ? renderSellingTimeCreateSidePanel()
          : isSellingTimePage && isDetailPanelOpen
            ? renderSellingTimeDetailSidePanel(selectedSellingTimeDetailRow)
            : null}
        {isDeviceManagementCreateOpen
          ? renderDeviceManagementCreateSidePanel()
          : isDeviceManagementPage && isDetailPanelOpen
            ? renderDeviceManagementDetailSidePanel(
              selectedDeviceManagementDetailRow
            )
            : null}
        {isGroupedDeviceCreateOpen
          ? renderGroupedDeviceCreateSidePanel()
          : isGroupedDevicePage && isDetailPanelOpen
            ? renderGroupedDeviceDetailSidePanel(selectedGroupedDeviceDetailRow)
            : null}
        {isRoleAccessCreateOpen
          ? renderRoleAccessCreateSidePanel()
          : isRoleAccessPage && isDetailPanelOpen
            ? renderRoleAccessDetailSidePanel(selectedRoleAccessDetailRow)
            : null}
      </section>
    );
  }

  function cancelDeviceManagementDetailEdit() {
    const currentRow = (records["device-management"] || []).find(d => d.id === deviceManagementDetailId);
    if (currentRow && deviceManagementDraft.deviceName !== currentRow.deviceName) {
      discardEditActionRef.current = executeCancelDeviceManagementDetailEdit;
      setDiscardEditModalOpen(true);
      return;
    }
    executeCancelDeviceManagementDetailEdit();
  }

  function executeCancelDeviceManagementDetailEdit() {
    setDeviceManagementDetailEditing(null);
    setDeviceManagementDetailErrors({});
    const currentRow = (records["device-management"] || []).find(d => d.id === deviceManagementDetailId);
    if (currentRow) {
      setDeviceManagementDraft((prev) => ({ ...prev, deviceName: currentRow.deviceName }));
    }
  }

  function saveDeviceManagementDetailEdit(showSnackbarMessage = true) {
    const trimmed = deviceManagementDetailDraftRef.current?.deviceName?.trim() || "";
    if (!trimmed) {
      setDeviceManagementDetailErrors({ deviceName: true });
      return false;
    }

    const duplicateNameError = getDuplicateDeviceNameError(trimmed, deviceManagementDetailId);
    if (duplicateNameError) {
      setDeviceManagementDetailErrors({ deviceName: duplicateNameError });
      return false;
    }

    setDeviceManagementDetailErrors({});
    setRecords((prev) => ({
      ...prev,
      "device-management": (prev["device-management"] || []).map((d) =>
        d.id === deviceManagementDetailId ? { ...d, deviceName: trimmed } : d
      ),
    }));
    setDeviceManagementDetailEditing(null);
    if (showSnackbarMessage) {
      showSnackbar("Device name updated", "black");
    }
    return true;
  }

  function openDeviceManagementDetailPanel(
    rowId,
    { skipCreateGuard = false } = {}
  ) {
    if (
      !skipCreateGuard &&
      guardCreatePanelNavigation(() =>
        openDeviceManagementDetailPanel(rowId, { skipCreateGuard: true })
      )
    ) {
      return;
    }

    if (currentPage !== "device-management") {
      handleSetPage("device-management", { skipCreateGuard: true });
    }

    setDeviceManagementDetailId(rowId);
    setDeviceManagementDetailEditing(null);
    setDeviceManagementDetailPanelTab("general");
    resetDeviceManagementDraft();
  }

  function handleSaveDeviceManagementDraft() {
    const errors = {};
    const trimmedName = deviceManagementDraft.deviceName.trim();
    if (!trimmedName) errors.deviceName = true;
    const duplicateNameError = getDuplicateDeviceNameError(trimmedName);
    if (duplicateNameError) errors.deviceName = duplicateNameError;
    if (!deviceManagementDraft.deviceType) errors.deviceType = true;
    if (Object.keys(errors).length) {
      setDeviceManagementDraftErrors(errors);
      return;
    }
    const code = generateRandomPairingCode();
    const now = new Date();
    const formatted = createDeviceManagementTimestamp(now);
    let connectedDevices = (deviceManagementDraft.connectedDevices || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    // Enforce only one connected device for non-printer devices
    if (deviceManagementDraft.deviceType !== "Printer" && connectedDevices.length > 1) {
      connectedDevices = [connectedDevices[0]];
    }
    const newDevice = {
      id: `dm-${Date.now()}`,
      deviceName: trimmedName,
      pairingCode: code,
      deviceType: deviceManagementDraft.deviceType,
      status: "Pending",
      deviceConnected: connectedDevices.length ? connectedDevices.join(", ") : null,
      connectedDevices,
      deviceOs: null,
      pairingExpiresAt: Date.now() + 15 * 60 * 1000,
      lastActive: formatted,
      addedBy: "Natasha Smith",
      addedByName: "Natasha Smith",
      addedByRole: "Owner",
    };
    setRecords((prev) => ({
      ...prev,
      "device-management": [newDevice, ...prev["device-management"]],
    }));
    pendingCreateNavigationRef.current = null;
    setDiscardCreateModalOpen(false);
    setPairingCodePopup(newDevice);
    scheduleDevicePairingSimulation(newDevice);
    resetDeviceManagementDraft();
    handleSetPage("device-management", { skipCreateGuard: true });
  }

  function handleSaveGroupedDeviceDraft() {
    const errors = {};
    const trimmedName = (groupedDeviceDraft.name || "").trim();
    const normalizedDeviceList = getNormalizedGroupedDeviceTabletRows(
      records["device-management"] || [],
      groupedDeviceDraft.deviceList
    ).map((device) => device.id);
    const normalizedCatalogList = getNormalizedGroupedDeviceCatalogIds(
      records.catalog || [],
      groupedDeviceDraft.catalogList
    );
    if (!trimmedName) errors.name = true;

    const duplicateNameError = getDuplicateKdsGroupNameError(trimmedName);
    if (duplicateNameError) {
      errors.name = duplicateNameError;
    }

    if (!normalizedDeviceList.length) {
      errors.deviceList = true;
    }
    if (!normalizedCatalogList.length) {
      errors.catalogList = true;
    }

    if (Object.keys(errors).length) {
      setGroupedDeviceDraftErrors(errors);
      return;
    }
    const newGroup = {
      id: `gd-${Date.now()}`,
      name: trimmedName,
      deviceList: normalizedDeviceList,
      catalogList: normalizedCatalogList,
    };
    setRecords((prev) => ({
      ...prev,
      "grouped-device": [newGroup, ...prev["grouped-device"]],
    }));
    resetGroupedDeviceDraft();
    handleSetPage("grouped-device");
  }

  function renderGroupedDeviceCreateSidePanel() {
    const deviceRows = records["device-management"] || [];
    const groupedDeviceGroups = records["grouped-device"] || [];
    const normalizedDeviceList = getNormalizedGroupedDeviceTabletRows(
      deviceRows,
      groupedDeviceDraft.deviceList
    ).map((device) => device.id);
    const deviceSelectionOptions = buildGroupedDeviceSelectionOptions(
      deviceRows,
      groupedDeviceGroups,
      { currentValues: groupedDeviceDraft.deviceList }
    );

    return (
      <aside className="catalog-detail-side-panel catalog-detail-panel catalog-create-side-panel">
        <div className="catalog-detail-panel__header">
          <div className="catalog-detail-panel__titlebar">
            <p className="catalog-detail-panel__title type-title-2">
              Add New KDS Group
            </p>
            <div className="catalog-detail-panel__actions">
              <button
                type="button"
                className="catalog-detail-panel__close"
                onClick={closeGroupedDeviceCreatePage}
                aria-label="Close add KDS Group panel"
              >
                <Icon
                  name="panelClose"
                  className="lab-icon lab-icon--16"
                  alt="Close"
                />
              </button>
            </div>
          </div>
        </div>
        <div className="catalog-detail-panel__body">
          <div className="catalog-create-side-panel__content catalog-create-side-panel__content--compact">
            <DetailSection title="General Information">
              <div className="catalog-panel-info-list catalog-panel-info-list--single-column">
                <DetailField
                  label="KDS Group Name"
                  required
                  value={groupedDeviceDraft.name}
                  placeholder="e.g. Kitchen Group"
                  onChange={(value) =>
                    setGroupedDeviceDraft((prev) => ({ ...prev, name: String(value ?? "").slice(0, 40) }))
                  }
                  error={groupedDeviceDraftErrors.name}
                  maxLength={40}
                />
                <DetailSelectField
                  label="Device List"
                  required
                  error={groupedDeviceDraftErrors.deviceList}
                  value={normalizedDeviceList}
                  options={deviceSelectionOptions}
                  onChange={(value) =>
                    setGroupedDeviceDraft((prev) => ({ ...prev, deviceList: value }))
                  }
                  placeholder="Select Devices"
                  multiple
                  multipleDisplay="summary"
                  multipleSummaryFormatter={({
                    selectedValues,
                    selectedLabels,
                    placeholder,
                  }) =>
                    getGroupedDeviceListSummary({
                      selectedValues,
                      selectedLabels,
                      placeholder,
                      totalOptions: deviceSelectionOptions.filter(
                        (option) => !option.disabled
                      ).length,
                    })
                  }
                />
                <ModifierCatalogModalField
                  label="Catalog List"
                  required
                  error={groupedDeviceDraftErrors.catalogList}
                  value={groupedDeviceDraft.catalogList}
                  groups={groupedDeviceCreateCatalogGroups}
                  onClick={() =>
                    openModifierCatalogModal(
                      "grouped-device-create",
                      groupedDeviceDraft.catalogList
                    )
                  }
                  placeholder="Select KDS Catalogs"
                  ellipsis
                />
              </div>
            </DetailSection>
          </div>
        </div>
        <div className="catalog-detail-panel__footer">
          <CreatePanelFooter
            isFirstStep
            isLastStep
            onCancel={closeGroupedDeviceCreatePage}
            onSubmit={handleSaveGroupedDeviceDraft}
            submitLabel="Save"
          />
        </div>
      </aside>
    );
  }

  function renderGroupedDeviceDetailSidePanel(row) {
    if (!row || !groupedDeviceDetailDraft) return null;
    const isEditing = Boolean(groupedDeviceDetailEditing);
    const displayName = isEditing ? groupedDeviceDetailDraft.name : row.name;
    const deviceRows = records["device-management"] || [];
    const catalogRows = records["catalog"] || [];

    const targetDeviceList = isEditing ? groupedDeviceDetailDraft.deviceList : row.deviceList;
    const targetCatalogList = isEditing ? groupedDeviceDetailDraft.catalogList : row.catalogList;
    const normalizedDeviceList = getNormalizedGroupedDeviceTabletRows(
      deviceRows,
      targetDeviceList || []
    ).map((device) => device.id);
    const deviceSelectionOptions = buildGroupedDeviceSelectionOptions(
      deviceRows,
      records["grouped-device"] || [],
      {
        currentGroupId: row.id,
        currentValues: targetDeviceList || [],
      }
    );
    const groupedDeviceDeviceRows = buildGroupedDeviceDetailRows(
      deviceRows,
      targetDeviceList || []
    );
    const catalogNames = getGroupedDeviceCatalogNames(
      catalogRows,
      targetCatalogList || []
    );

    return (
      <aside className="catalog-detail-side-panel catalog-detail-panel">
        <div className="catalog-detail-panel__header">
          <div className="catalog-detail-panel__titlebar">
            <p className="catalog-detail-panel__title type-title-2">{displayName}</p>
            <div className="catalog-detail-panel__actions">
              {!isEditing && (
                <button
                  type="button"
                  className="lab-button lab-button--small lab-button--secondary"
                  onClick={() => setGroupedDeviceDetailEditing({ kind: "all" })}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Icon name="edit" className="lab-icon lab-icon--16" alt="" />
                  <span className="type-subtitle-2">Edit</span>
                </button>
              )}
              <button
                type="button"
                className="catalog-detail-panel__close"
                onClick={() => {
                  setGroupedDeviceDetailId(null);
                  setGroupedDeviceDetailEditing(null);
                }}
                aria-label="Close"
              >
                <Icon
                  name="panelClose"
                  className="lab-icon lab-icon--16"
                  alt="Close"
                />
              </button>
            </div>
          </div>
        </div>
        <div className="catalog-detail-panel__body">
          <div className="catalog-create-side-panel__content catalog-create-side-panel__content--compact">
            <DetailSection title="General Information">
              <div className="catalog-panel-info-list catalog-panel-info-list--single-column">
                {isEditing ? (
                  <>
                    <DetailField
                      label="KDS Group Name"
                      required
                      error={groupedDeviceDetailDraftErrors.name}
                      value={groupedDeviceDetailDraft.name}
                      onChange={(val) =>
                        setGroupedDeviceDetailDraft((prev) => ({
                          ...prev,
                          name: String(val ?? "").slice(0, 40),
                        }))
                      }
                      maxLength={40}
                    />
                    <DetailSelectField
                      label="Device List"
                      required
                      error={groupedDeviceDetailDraftErrors.deviceList}
                      value={normalizedDeviceList}
                      options={deviceSelectionOptions}
                      onChange={(value) =>
                        setGroupedDeviceDetailDraft((prev) => ({
                          ...prev,
                          deviceList: value,
                        }))
                      }
                      placeholder="Select Devices"
                      multiple
                      multipleDisplay="summary"
                      multipleSummaryFormatter={({
                        selectedValues,
                        selectedLabels,
                        placeholder,
                      }) =>
                        getGroupedDeviceListSummary({
                          selectedValues,
                          selectedLabels,
                          placeholder,
                          totalOptions: deviceSelectionOptions.filter(
                        (option) => !option.disabled
                      ).length,
                        })
                      }
                    />
                    <ModifierCatalogModalField
                      label="Catalog List"
                      required
                      error={groupedDeviceDetailDraftErrors.catalogList}
                      value={groupedDeviceDetailDraft.catalogList}
                      groups={groupedDeviceDetailCatalogGroups}
                      onClick={() =>
                        openModifierCatalogModal(
                          "grouped-device-detail",
                          groupedDeviceDetailDraft.catalogList
                        )
                      }
                      placeholder="Select KDS Catalogs"
                      ellipsis
                    />
                  </>
                ) : (
                  <>
                    <CatalogPanelInfoRow
                      label="KDS Group Name"
                      value={displayName}
                    />
                    <CatalogPanelInfoRow
                      label="Device List"
                      value={
                        groupedDeviceDeviceRows.length ? (
                          <ul className="grouped-device-detail-list">
                            {groupedDeviceDeviceRows.map((device) => (
                              <li
                                key={device.tabletName}
                                className="grouped-device-detail-list__item"
                              >
                                <span className="grouped-device-detail-list__row">
                                  <span>{device.tabletName}</span>
                                  <DeviceStatusIndicator status={device.tabletStatus} />
                                </span>
                                {device.printers.length ? (
                                  <ul className="grouped-device-detail-list grouped-device-detail-list--nested">
                                    {device.printers.map((printer) => (
                                      <li key={printer}>{printer}</li>
                                    ))}
                                  </ul>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        ) : "-"
                      }
                    />
                    <CatalogPanelInfoRow
                      label="Catalog List"
                      value={
                        catalogNames.length ? (
                          <ul className="grouped-device-detail-list">
                            {catalogNames.map((name) => (
                              <li key={name}>{name}</li>
                            ))}
                          </ul>
                        ) : "-"
                      }
                    />
                  </>
                )}
              </div>
            </DetailSection>
          </div>
        </div>
        {isEditing ? (
          <div className="catalog-detail-panel__footer" style={{ display: "flex", gap: "12px", width: "100%" }}>
            <button
              type="button"
              className="lab-button lab-button--medium lab-button--danger-outline"
              style={{ flex: 1 }}
              onClick={cancelGroupedDeviceDetailEdit}
            >
              <span className="type-subtitle-2">Cancel</span>
            </button>
            <button
              type="button"
              className="lab-button lab-button--primary lab-button--medium"
              style={{ flex: 1 }}
              onClick={saveGroupedDeviceDetailEdit}
            >
              <span className="type-subtitle-2">Save Changes</span>
            </button>
          </div>
        ) : (
          <DetailPanelDeleteAction
            ariaLabel="Delete KDS Group"
            onDelete={() => requestDeleteRow("grouped-device", row.id, row.name)}
          />
        )}
      </aside>
    );
  }

  function saveGroupedDeviceDetailEdit() {
    const errors = {};
    const trimmedName = (groupedDeviceDetailDraft.name || "").trim();
    const normalizedDeviceList = getNormalizedGroupedDeviceTabletRows(
      records["device-management"] || [],
      groupedDeviceDetailDraft.deviceList
    ).map((device) => device.id);
    const normalizedCatalogList = getNormalizedGroupedDeviceCatalogIds(
      records.catalog || [],
      groupedDeviceDetailDraft.catalogList
    );
    if (!trimmedName) errors.name = true;

    const duplicateNameError = getDuplicateKdsGroupNameError(
      trimmedName,
      groupedDeviceDetailId
    );
    if (duplicateNameError) {
      errors.name = duplicateNameError;
    }

    if (!normalizedDeviceList.length) {
      errors.deviceList = true;
    }
    if (!normalizedCatalogList.length) {
      errors.catalogList = true;
    }

    if (Object.keys(errors).length) {
      setGroupedDeviceDetailDraftErrors(errors);
      return;
    }

    setRecords((prev) => ({
      ...prev,
      "grouped-device": prev["grouped-device"].map((g) =>
        g.id === groupedDeviceDetailId
          ? {
            ...groupedDeviceDetailDraft,
            name: trimmedName,
            deviceList: normalizedDeviceList,
            catalogList: normalizedCatalogList,
          }
          : g
      ),
    }));
    setGroupedDeviceDetailEditing(null);
    setGroupedDeviceDetailDraftErrors({});
    showSnackbar("KDS group updated", "black");
  }

  function cancelGroupedDeviceDetailEdit() {
    setGroupedDeviceDetailEditing(null);
    const originalRow = records["grouped-device"].find((g) => g.id === groupedDeviceDetailId);
    if (originalRow) {
      setGroupedDeviceDetailDraft({ ...originalRow });
    }
  }

  function renderRoleAccessCreateSidePanel() {
    const rolePermissionsStructure = getRolePermissionsStructure(
      Boolean(selectedSidebarBusinessUnit)
    );

    return (
      <RoleManagementCreatePanel
        draft={roleAccessDraft}
        errors={roleAccessDraftErrors}
        activeTab={roleAccessCreatePanelTab}
        isMainAccountSide={!selectedSidebarBusinessUnit}
        onTabChange={setRoleAccessCreatePanelTab}
        onNext={goToRoleAccessCreateRmsTab}
        onClose={closeRoleAccessCreatePage}
        onChange={handleRoleAccessChange}
        onSave={saveRoleAccessDraft}
        permissionsStructure={rolePermissionsStructure}
        DetailSection={DetailSection}
        DetailField={DetailField}
      />
    );
  }

  function renderRoleAccessDetailSidePanel(row) {
    const rolePermissionsStructure = getRolePermissionsStructure(
      Boolean(selectedSidebarBusinessUnit)
    );

    return (
      <RoleManagementDetailPanel
        row={row}
        draft={roleAccessDetailDraft}
        errors={roleAccessDetailErrors}
        editing={roleAccessDetailEditing}
        activeTab={roleAccessDetailPanelTab}
        isMainAccountSide={!selectedSidebarBusinessUnit}
        members={row.membersList || []}
        onTabChange={(tab) => setRoleAccessDetailPanelTab(tab)}
        onClose={resetRoleAccessDetailState}
        onEdit={(value) => {
          setRoleAccessDetailPanelTab("general");
          setRoleAccessDetailEditing(value);
          setRoleAccessDetailErrors({});
        }}
        onNext={goToRoleAccessDetailRmsTab}
        onCancel={cancelRoleAccessDetailEdit}
        onSave={saveRoleAccessDetailEdit}
        onChange={handleRoleAccessChange}
        onDelete={() => requestDeleteRow("role-access", row.id, row.name)}
        permissionsStructure={rolePermissionsStructure}
        DetailSection={DetailSection}
        DetailField={DetailField}
        CatalogPanelInfoRow={CatalogPanelInfoRow}
        DetailPanelDeleteAction={DetailPanelDeleteAction}
        StatusPillComponent={StatusPill}
      />
    );
  }

  function renderDeviceManagementCreateSidePanel() {
    const deviceTypeOptions = [
      "Point of Sales (POS)",
      "Kitchen Display System (KDS)",
      "Payment",
      "Kiosk",
    ];
    return (
      <aside className="catalog-detail-side-panel catalog-detail-panel catalog-create-side-panel">
        <div className="catalog-detail-panel__header">
          <div className="catalog-detail-panel__titlebar">
            <p className="catalog-detail-panel__title type-title-2">Add New Device</p>
            <div className="catalog-detail-panel__actions">
              <button
                type="button"
                className="catalog-detail-panel__close"
                onClick={closeDeviceManagementCreatePage}
                aria-label="Close add device panel"
              >
                <Icon name="panelClose" className="lab-icon lab-icon--16" alt="Close" />
              </button>
            </div>
          </div>
        </div>
        <div className="catalog-detail-panel__body">
          <div className="catalog-create-side-panel__content catalog-create-side-panel__content--compact">
            <DetailSection title="General Information">
              <div className="catalog-panel-info-list">
                <DetailField
                  label="Device Name"
                  required
                  value={deviceManagementDraft.deviceName}
                  placeholder="e.g. Cashier Tablet A"
                  onChange={(value) => setDeviceManagementDraft((prev) => ({ ...prev, deviceName: String(value ?? "").slice(0, 40) }))}
                  error={deviceManagementDraftErrors.deviceName}
                  maxLength={40}
                />
                <DetailSelectField
                  label="Device Type"
                  required
                  value={deviceManagementDraft.deviceType}
                  options={deviceTypeOptions}
                  onChange={(value) => {
                    setDeviceManagementDraft((prev) => ({ ...prev, deviceType: value }));
                    setDeviceManagementDraftErrors((prev) => ({ ...prev, deviceType: undefined }));
                  }}
                  placeholder="Select Device Type"
                  error={deviceManagementDraftErrors.deviceType}
                  ellipsis
                />
              </div>
            </DetailSection>
          </div>
        </div>
        <div className="catalog-detail-panel__footer">
          <CreatePanelFooter
            isFirstStep
            isLastStep
            onCancel={closeDeviceManagementCreatePage}
            onSubmit={handleSaveDeviceManagementDraft}
            submitLabel="Generate Pairing Code"
          />
        </div>
      </aside>
    );
  }

  function renderDeviceManagementDetailSidePanel(row) {
    if (!row) return null;
    const isEditingDeviceName = deviceManagementDetailEditing === "deviceName";
    const displayName = deviceManagementDraft.deviceName?.trim() || row.deviceName;
    const isDisconnected = row.status === "Disconnected";
    const isPending = row.status === "Pending";
    const isExpired = row.status === "Expired";
    const isPrinterDevice = row.deviceType === "Printer";
    const isTabletOrKiosk = [
      "Point of Sales (POS)",
      "Point of Sales (POS)",
      "Kitchen Display System (KDS)",
      "Point of Sales (POS)",
      "Kiosk",
    ].includes(row.deviceType);
    const detailActionsDisabled = isPrinterDevice;
    const showTabs = isPrinterDevice || isTabletOrKiosk;
    const allDeviceRecords = records["device-management"] || [];
    const ownConnectedNames = Array.isArray(row.connectedDevices) ? row.connectedDevices : [];
    const ownConnectedSet = new Set(ownConnectedNames);
    const reverseConnectedNames = allDeviceRecords
      .filter((d) => {
        if (d.id === row.id || ownConnectedSet.has(d.deviceName)) return false;
        if (!Array.isArray(d.connectedDevices)) return false;
        return d.connectedDevices.includes(row.deviceName) || d.connectedDevices.includes(row.id);
      })
      .map((d) => d.deviceName);
    const allConnectedNamesRaw = [...ownConnectedNames, ...reverseConnectedNames];
    // A printer's "Connected Device" tab should only ever list the tablets/POS/KDS/Kiosk
    // devices attached to it, never another printer.
    const allConnectedNames = isPrinterDevice
      ? allConnectedNamesRaw.filter(
          (name) => allDeviceRecords.find((item) => item.deviceName === name)?.deviceType !== "Printer"
        )
      : allConnectedNamesRaw;

    const connectedDeviceDetails = allConnectedNames.map((connectedDeviceName) => {
      const connectedRow = allDeviceRecords.find((item) => item.deviceName === connectedDeviceName);
      const connectedDeviceStatus = connectedRow?.status ?? "Disconnected";
      const isConnectedDeviceOffline = connectedDeviceStatus !== "Connected";

      if (!isPrinterDevice) {
        // connectedDeviceName here is a printer; show its own IP Address (LAN) or Bluetooth ID (Bluetooth).
        const { label, value } = getPrinterConnectionDisplay(connectedRow);
        return {
          name: connectedDeviceName,
          connectedLabel: isConnectedDeviceOffline ? "-" : `${label}: ${value}`,
          lastActive: connectedRow?.lastActive ?? "-",
          status: connectedDeviceStatus,
        };
      }

      const forwardIndex = ownConnectedNames.indexOf(connectedDeviceName);
      let hardwareName;

      if (forwardIndex !== -1) {
        const hardwareNames = (row.deviceConnected || "").split(",").map((s) => s.trim());
        hardwareName = hardwareNames[forwardIndex] || "-";
      } else {
        // Reverse lookup: tablet's hardware name via display value (derived from printer's record)
        const displayVal = getDeviceConnectedDisplayValue(connectedRow);
        hardwareName =
          displayVal && displayVal !== "-" && displayVal !== connectedRow?.deviceName
            ? displayVal
            : "-";
      }

      return {
        name: connectedDeviceName,
        connectedLabel: isConnectedDeviceOffline ? "-" : `${hardwareName} • ${connectedRow?.deviceOs ?? "-"}`,
        lastActive: connectedRow?.lastActive ?? "-",
        status: connectedDeviceStatus,
      };
    });
    const activeDeviceManagementDetailTab = showTabs
      ? deviceManagementDetailPanelTab
      : "general";
    const connectionActionLabel = isExpired
      ? "Regenerate"
      : isDisconnected
        ? "Turn On"
        : isPending
          ? "Turn Off"
          : "Disconnect";
    const deviceConnectedValue = getDeviceConnectedDisplayValue(row);
    const printerConnectionInfo = getPrinterConnectionDisplay(row);
    const deviceOsValue = row.status === "Connected" ? row.deviceOs ?? "-" : "-";
    const isConnectionActionDisabled = detailActionsDisabled;

    return (
      <aside className="catalog-detail-side-panel catalog-detail-panel">
        <div className="catalog-detail-panel__header">
          <div className="catalog-detail-panel__titlebar">
            <p className="catalog-detail-panel__title type-title-2">{displayName}</p>
            <div className="catalog-detail-panel__actions">
              {!isEditingDeviceName && (
                <button
                  type="button"
                  className="lab-button lab-button--small lab-button--secondary"
                  onClick={() => {
                    setDeviceManagementDraft((prev) => ({ ...prev, deviceName: row.deviceName }));
                    setDeviceManagementDetailEditing("deviceName");
                  }}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Icon name="edit" className="lab-icon lab-icon--16" alt="" />
                  <span className="type-subtitle-2">Edit</span>
                </button>
              )}
              <button
                type="button"
                className="catalog-detail-panel__close"
                onClick={() => {
                  setDeviceManagementDetailId(null);
                  setDeviceManagementDetailEditing(null);
                }}
                aria-label="Close"
              >
                <Icon name="panelClose" className="lab-icon lab-icon--16" alt="Close" />
              </button>
            </div>
          </div>
          {showTabs && !isEditingDeviceName ? (
            <div className="catalog-detail-panel__tabbar">
              <div className="catalog-detail-panel__tabs" role="tablist">
                <button
                  type="button"
                  className={`catalog-detail-panel__tab${activeDeviceManagementDetailTab === "general" ? " is-active" : ""}`}
                  onClick={() => setDeviceManagementDetailPanelTab("general")}
                >
                  General
                </button>
                <button
                  type="button"
                  className={`catalog-detail-panel__tab${activeDeviceManagementDetailTab === "other-device-connected" ? " is-active" : ""}`}
                  onClick={() => setDeviceManagementDetailPanelTab("other-device-connected")}
                >
                  {isPrinterDevice ? "Connected Device" : "Other Connected Device"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="catalog-detail-panel__body">
          {activeDeviceManagementDetailTab === "general" ? (
            <>
              <DetailSection title="General Information">
                {row.status === "Pending" && row.pairingExpiresAt ? (
                  <div className="lab-infobox lab-infobox--orange device-detail-expiry-box">
                    <div
                      className="device-detail-expiry-box__copy"
                      style={{ display: "flex", alignItems: "center", gap: "16px" }}
                    >
                      <span
                        className="device-detail-expiry-box__info-icon"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                        aria-hidden="true"
                      >
                        <Icon
                          name="sellingTimeTooltip"
                          className="lab-icon lab-icon--18"
                          alt=""
                          color="var(--status-orange-primary)"
                        />
                      </span>
                      <div style={{ flex: 1 }}>
                        <p className="device-detail-expiry-box__title type-body-bold" style={{ margin: 0 }}>
                          Device Pairing Pending
                        </p>
                        <p className="type-body" style={{ margin: 0 }}>
                          This device is waiting for the operator to enter the generated pairing code. Unused codes will be auto expired.
                        </p>
                      </div>
                    </div>
                    <span className="device-detail-expiry-box__value type-subtitle-2">
                      <PendingCountdown expiresAt={row.pairingExpiresAt} showLabel={false} />
                    </span>
                  </div>
                ) : null}
                <div className="catalog-panel-info-list">
                  {isEditingDeviceName ? (
                    <>
                      <DetailField
                        label="Device Name"
                        required
                        autoFocus
                        value={deviceManagementDraft.deviceName}
                        placeholder={row.deviceName}
                        onChange={(value) =>
                          setDeviceManagementDraft((prev) => ({ ...prev, deviceName: String(value ?? "").slice(0, 40) }))
                        }
                        error={deviceManagementDetailErrors.deviceName}
                        maxLength={40}
                      />
                      {isPrinterDevice && (
                        <DetailField
                          label={printerConnectionInfo.label}
                          value={printerConnectionInfo.value}
                          disabled
                        />
                      )}
                      <DetailField label="Device Type" value={row.deviceType} disabled ellipsis />
                      {isPending && !isPrinterDevice && row.pairingCode && (
                        <DetailField label="Pairing Code" value={row.pairingCode} disabled />
                      )}
                      <DetailField label="Status" value={row.status} disabled />
                      <DetailField label="Last Active" value={row.lastActive} disabled />
                      <DetailField label="Added By" value={`${row.addedByName ?? row.addedBy} - ${row.addedByRole ?? ""}`} disabled />
                    </>
                  ) : (
                    <>
                      <CatalogPanelInfoRow
                        label="Device Name"
                        value={displayName}
                      />
                      {isPrinterDevice && (
                        <CatalogPanelInfoRow
                          label={printerConnectionInfo.label}
                          value={printerConnectionInfo.value}
                        />
                      )}
                      <CatalogPanelInfoRow label="Device Type" value={row.deviceType} ellipsis />
                      {isPending && !isPrinterDevice && row.pairingCode && (
                        <CatalogPanelInfoRow
                          label="Pairing Code"
                          value={
                            row.pairingCode === "-" ? (
                              row.pairingCode
                            ) : (
                              <span
                                style={{
                                  alignItems: "center",
                                  display: "inline-flex",
                                  gap: "8px",
                                  justifyContent: "flex-start",
                                  width: "100%",
                                }}
                              >
                                <span className="type-subtitle-2">{row.pairingCode}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(row.pairingCode);
                                    showSnackbar("Pairing code copied", "green");
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    padding: 0,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                  aria-label="Copy pairing code"
                                >
                                  <Icon
                                    name="copy"
                                    className="lab-icon lab-icon--16"
                                    color="var(--feature-brand-primary)"
                                  />
                                </button>
                              </span>
                            )
                          }
                        />
                      )}
                      <CatalogPanelInfoRow
                        label="Status"
                        value={
                          <span
                            style={{
                              alignItems: "center",
                              display: "inline-flex",
                              gap: "12px",
                              justifyContent: "flex-start",
                              width: "100%",
                            }}
                          >
                            <StatusPill status={row.status} />
                          </span>
                        }
                      />
                      <CatalogPanelInfoRow label="Last Active" value={row.lastActive} />
                      <CatalogPanelInfoRow label="Added By" value={
                        <span
                          style={{
                            alignItems: "flex-start",
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "left",
                            width: "100%",
                          }}
                        >
                          <span className="type-subtitle-2">
                            {row.addedByName ?? row.addedBy}
                          </span>
                          <span className="type-body text-secondary">
                            {row.addedByRole ?? ""}
                          </span>
                        </span>
                      } />
                    </>
                  )}
                </div>
              </DetailSection>
              {!isPrinterDevice && (
                <>
                  <div
                    style={{
                      background: "var(--neutral-background)",
                      height: "4px",
                      margin: "24px -24px",
                    }}
                    aria-hidden="true"
                  />
                  <DetailSection title="Device Connected Information">
                    <div className="catalog-panel-info-list">
                      <CatalogPanelInfoRow
                        label="Device Connected"
                        value={deviceConnectedValue.split(",")[0].trim()}
                      />
                      <CatalogPanelInfoRow label="Device OS" value={deviceOsValue} />
                    </div>
                  </DetailSection>
                </>
              )}
            </>
          ) : (
            <DetailSection title={isPrinterDevice ? "Connected Device" : "Other Connected Device"}>
              {connectedDeviceDetails.length ? (
                <div className="catalog-detail-panel__list">
                  {connectedDeviceDetails.map((device) => (
                    <div
                      key={device.name}
                      className="catalog-detail-panel__list-item catalog-detail-panel__connected-device"
                    >
                      <div className="catalog-detail-panel__connected-device-row">
                        <p className="type-subtitle-2">{device.name}</p>
                        <DeviceStatusIndicator status={device.status} />
                      </div>
                      <div className="catalog-detail-panel__connected-device-row">
                        <p className="type-body text-secondary">{device.connectedLabel}</p>
                        <p className="type-body text-secondary">{device.lastActive}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="type-body text-secondary">
                  No devices are currently connected to this {isPrinterDevice ? "printer" : "device"}.
                </p>
              )}
            </DetailSection>
          )}
        </div>
        <div className="catalog-detail-panel__footer device-management-detail-footer">
          {isEditingDeviceName ? (
            <div style={{ display: "flex", gap: "12px", width: "100%" }}>
              <button
                type="button"
                className="lab-button lab-button--medium lab-button--danger-outline"
                style={{ flex: 1 }}
                onClick={cancelDeviceManagementDetailEdit}
              >
                <span className="type-subtitle-2">Cancel</span>
              </button>
              <button
                type="button"
                className="lab-button lab-button--primary lab-button--medium"
                style={{ flex: 1 }}
                onClick={() => saveDeviceManagementDetailEdit(true)}
              >
                <span className="type-subtitle-2">Save Changes</span>
              </button>
            </div>
          ) : (
            <>
              {isDisconnected && (
                <button
                  type="button"
                  className="lab-button lab-button--primary lab-button--medium"
                  style={{ flex: 1 }}
                  onClick={() => requestDeviceStatusChange(row, "Connected")}
                >
                  <Icon name="power" className="lab-icon lab-icon--16" alt="" />
                  <span className="type-subtitle-1">Turn On</span>
                </button>
              )}
              {isExpired && (
                <button
                  type="button"
                  className="lab-button lab-button--primary lab-button--medium"
                  style={{ flex: 1 }}
                  disabled={isConnectionActionDisabled}
                  onClick={() => {
                    if (detailActionsDisabled) return;
                    handleStartDevicePendingPairing(
                      row,
                      Boolean(row.isReconnectFromDisconnect)
                    );
                  }}
                >
                  <Icon name="power" className="lab-icon lab-icon--16" alt="" />
                  <span className="type-subtitle-1">Regenerate</span>
                </button>
              )}
              {!isDisconnected && !isExpired && (
                <button
                  type="button"
                  className="lab-button lab-button--medium lab-button--danger-outline"
                  style={{ flex: 1 }}
                  disabled={isConnectionActionDisabled}
                  onClick={() => {
                    if (detailActionsDisabled) return;
                    requestDeviceStatusChange(
                      row,
                      "Disconnected",
                      isPending
                        ? { disconnectLabel: "Turn Off Connection" }
                        : undefined
                    );
                  }}
                >
                  <Icon
                    name="power"
                    className="lab-icon lab-icon--16"
                    alt=""
                    color={isConnectionActionDisabled
                      ? "#A9A9A9"
                      : "var(--status-red-primary)"}
                  />
                  <span className="type-subtitle-2">{connectionActionLabel}</span>
                </button>
              )}
              <button
                type="button"
                className={`lab-button lab-button--medium lab-button--danger-outline${isPrinterDevice ? " is-disabled" : ""}`}
                style={{ flex: 1 }}
                disabled={detailActionsDisabled}
                onClick={() => {
                  if (detailActionsDisabled) return;
                  requestDeleteRow("device-management", row.id, row.deviceName);
                  setDeviceManagementDetailId(null);
                }}
              >
                <Icon
                  name="panelDelete"
                  className="lab-icon lab-icon--16"
                  alt=""
                  color={detailActionsDisabled
                    ? "#A9A9A9"
                    : "var(--status-red-primary)"}
                />
                <span className="type-subtitle-2">Delete</span>
              </button>
            </>
          )}
        </div>
      </aside>
    );
  }

  function renderDashboardPage() {
    const dashboardTitle = "Dashboard";
    const shouldHideBusinessUnitDashboardColumns =
      Boolean(selectedSidebarBusinessUnit);
    const dashboardPageClassName = `page-canvas${isLockedSelectedBusinessUnit ? " dashboard-page--locked" : ""
      }`;
    const businessUnitDashboardTabs = [
      { id: "sales-report", label: "Sales Report" },
      { id: "inventory-report", label: "Inventory Report" },
      { id: "cash-management", label: "Cash Management" },
      { id: "financial-report", label: "Financial Report" },
    ];
    const shouldShowDashboardBusinessUnitFilter = !selectedSidebarBusinessUnit;
    const scopedDashboardBusinessUnitNames =
      dashboardReportScopeLabel === ALL_BUSINESS_UNITS_LABEL
        ? allDashboardBusinessUnitNames
        : [dashboardReportScopeLabel];
    const salesReportDashboard = createSalesReportDashboard(
      dashboardReportScopeLabel,
      salesBreakdownTimeRange,
      salesBreakdownCustomRange,
      createDashboardReportAnchorDate(),
      scopedDashboardBusinessUnitNames
    );
    const inventoryReportDashboard = createInventoryReportDetail(
      dashboardReportScopeLabel,
      createDashboardReportAnchorDate()
    );
    const activeSalesSummaryOffset =
      salesSummaryNavigation[salesSummaryRange] ?? 0;
    const activeSalesSummaryComparisonSelection =
      salesSummaryComparisonSelection[salesSummaryRange] ?? {
        current: 0,
        compare: 1,
      };
    const activeSalesSummaryComparisonOptions =
      getSalesSummaryComparisonOptions(salesSummaryRange);
    const activeSalesSummaryPanel =
      salesSummaryMode === "comparison"
        ? createSalesSummaryComparisonPanel(
          salesSummaryRange,
          activeSalesSummaryComparisonSelection.current,
          activeSalesSummaryComparisonSelection.compare,
          salesSummaryMetric
        )
        : createSalesSummaryPanel(
          salesSummaryRange,
          activeSalesSummaryOffset,
          salesSummaryMetric
        );
    const salesBreakdownSummary = salesReportDashboard
      ? getDashboardSalesBreakdownSummaryForTimeRange(
        salesReportDashboard.salesBreakdownSummary,
        salesBreakdownTimeRange,
        salesBreakdownCustomRange
      )
      : null;
    const salesBreakdownTabs = salesBreakdownSummary?.tabs ?? [];
    const activeSalesBreakdownTab = salesBreakdownTabs.length
      ? salesBreakdownTabs.find((tab) => tab.id === salesBreakdownTab) ??
      salesBreakdownTabs[0]
      : null;
    const inventoryDashboardPageId = "dashboard-inventory-report";
    const activeInventoryDashboardTab =
      (inventoryReportDashboard?.tabs || []).find(
        (tab) => tab.id === inventoryDashboardTab
      ) ?? (inventoryReportDashboard?.tabs || [])[0] ?? null;
    const scopedInventoryDashboardColumns = getDashboardScopedColumns(
      activeInventoryDashboardTab?.columns ?? [],
      shouldHideBusinessUnitDashboardColumns
    );
    const inventoryDashboardSearch =
      (searchByPage[inventoryDashboardPageId] ?? "").trim().toLowerCase();
    const inventoryIngredientOptions = createUniqueCountedFilterOptions(
      activeInventoryDashboardTab?.rows ?? [],
      (row) => row.ingredient
    );
    const inventoryCategoryOptions = createUniqueCountedFilterOptions(
      activeInventoryDashboardTab?.rows ?? [],
      (row) => row.category
    );
    const inventoryStatusOptions =
      activeInventoryDashboardTab?.id === "stock-level"
        ? createCountedFilterOptions(
          ["Available", "Low", "Empty"],
          activeInventoryDashboardTab.rows || [],
          (row) => row.status
        )
        : [];
    const inventoryMovementTypeOptions =
      activeInventoryDashboardTab?.id === "stock-movement"
        ? createUniqueCountedFilterOptions(
          activeInventoryDashboardTab.rows || [],
          (row) => row.movementType
        )
        : [];
    const inventoryUpdatedByOptions =
      activeInventoryDashboardTab?.id === "stock-movement"
        ? createUniqueCountedFilterOptions(
          activeInventoryDashboardTab.rows || [],
          (row) => row.updatedBy
        )
        : [];
    const filteredInventoryDashboardRows = activeInventoryDashboardTab
      ? (activeInventoryDashboardTab.rows || []).filter((row) => {
        const matchesCategory =
          !inventoryDashboardFilters.category.length ||
          inventoryDashboardFilters.category.includes(row.category);
        const matchesIngredient =
          !inventoryDashboardFilters.ingredient.length ||
          inventoryDashboardFilters.ingredient.includes(row.ingredient);
        const matchesStatus =
          activeInventoryDashboardTab.id !== "stock-level" ||
          !inventoryDashboardFilters.status.length ||
          inventoryDashboardFilters.status.includes(row.status);
        const matchesMovementType =
          activeInventoryDashboardTab.id !== "stock-movement" ||
          !inventoryDashboardFilters.movementType.length ||
          inventoryDashboardFilters.movementType.includes(row.movementType);
        const matchesUpdatedBy =
          activeInventoryDashboardTab.id !== "stock-movement" ||
          !inventoryDashboardFilters.updatedBy.length ||
          inventoryDashboardFilters.updatedBy.includes(row.updatedBy);
        const matchesSearch =
          !inventoryDashboardSearch ||
          (activeInventoryDashboardTab.searchFields || []).some((field) =>
            String(row[field] ?? "")
              .toLowerCase()
              .includes(inventoryDashboardSearch)
          );

        return (
          matchesCategory &&
          matchesIngredient &&
          matchesStatus &&
          matchesMovementType &&
          matchesUpdatedBy &&
          matchesSearch
        );
      })
      : [];
    const sortedInventoryDashboardRows = (activeInventoryDashboardTab?.columns || []).some(
      (column) =>
        column.sortable &&
        (column.sortKey ?? column.key) === inventoryReportSort.key
    )
      ? filteredInventoryDashboardRows.slice().sort((left, right) => {
        const leftValue = left[inventoryReportSort.key];
        const rightValue = right[inventoryReportSort.key];

        if (typeof leftValue === "number" && typeof rightValue === "number") {
          return inventoryReportSort.direction === "asc"
            ? leftValue - rightValue
            : rightValue - leftValue;
        }

        return inventoryReportSort.direction === "asc"
          ? String(leftValue ?? "").localeCompare(String(rightValue ?? ""))
          : String(rightValue ?? "").localeCompare(String(leftValue ?? ""));
      })
      : filteredInventoryDashboardRows;
    const pagedInventoryDashboardRows = getPagedRows(
      inventoryDashboardPageId,
      sortedInventoryDashboardRows
    );
    const discountReport = salesReportDashboard?.discountReport ?? null;
    const cashManagementDashboard = createCashManagementDashboardData(
      dashboardReportScopeLabel
    );
    const financialReportDashboard = createFinancialReportDashboardData(
      dashboardReportScopeLabel,
      createDashboardReportAnchorDate()
    );
    const discountReportPageId = "dashboard-discount-report";
    const financialExpensePageId = "dashboard-financial-expense";
    const cashFlowPageId = "dashboard-cash-flow";
    const cashDropPageId = "dashboard-cash-drop";
    const cashAuditPageId = "dashboard-cash-audit";
    const discountReportSearch =
      searchByPage[discountReportPageId]?.trim().toLowerCase() ?? "";
    const financialExpenseSearch =
      searchByPage[financialExpensePageId]?.trim().toLowerCase() ?? "";
    const cashFlowSearch = searchByPage[cashFlowPageId]?.trim().toLowerCase() ?? "";
    const cashDropSearch = searchByPage[cashDropPageId]?.trim().toLowerCase() ?? "";
    const cashAuditSearch =
      searchByPage[cashAuditPageId]?.trim().toLowerCase() ?? "";
    const filteredDiscountReportRows = discountReport
      ? discountReport.rows.filter((row) =>
        row.discountName.toLowerCase().includes(discountReportSearch)
      )
      : [];
    const sortedDiscountReportRows = filteredDiscountReportRows.slice().sort((left, right) => {
      const leftValue = left[salesReportSort.key];
      const rightValue = right[salesReportSort.key];

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return salesReportSort.direction === "asc"
          ? leftValue - rightValue
          : rightValue - leftValue;
      }

      return salesReportSort.direction === "asc"
        ? String(leftValue ?? "").localeCompare(String(rightValue ?? ""))
        : String(rightValue ?? "").localeCompare(String(leftValue ?? ""));
    });
    const pagedDiscountReportRows = getPagedRows(
      discountReportPageId,
      sortedDiscountReportRows
    );
    const financialExpenseBaseRows = financialReportDashboard
      ? filterDashboardReportRowsByDate(
        financialReportDashboard.expenseRows,
        financialReportTimeRange,
        financialReportCustomRange,
        createDashboardReportAnchorDate()
      )
      : [];
    const filteredFinancialExpenseRows = financialReportDashboard
      ? financialExpenseBaseRows.filter((row) => {
        const matchesCategory =
          !financialExpenseCategoryFilters.length ||
          financialExpenseCategoryFilters.includes(row.expenseCategory);
        const matchesSearch =
          !financialExpenseSearch ||
          [
            row.date,
            row.expenseCategory,
            row.description,
            row.createdBy,
            row.amount,
          ].some((value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(financialExpenseSearch)
          );
        return matchesCategory && matchesSearch;
      })
      : [];
    const sortedFinancialExpenseRows = filteredFinancialExpenseRows.slice().sort((left, right) => {
      const leftValue = left[financialReportSort.key];
      const rightValue = right[financialReportSort.key];

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return financialReportSort.direction === "asc"
          ? leftValue - rightValue
          : rightValue - leftValue;
      }

      return financialReportSort.direction === "asc"
        ? String(leftValue ?? "").localeCompare(String(rightValue ?? ""))
        : String(rightValue ?? "").localeCompare(String(leftValue ?? ""));
    });
    const pagedFinancialExpenseRows = getPagedRows(
      financialExpensePageId,
      sortedFinancialExpenseRows
    );
    const financialExpenseCategoryOptions = financialReportDashboard
      ? createUniqueCountedFilterOptions(financialExpenseBaseRows, (row) =>
        row.expenseCategory
      )
      : [];
    const cashInOutBaseRows = cashManagementDashboard
      ? filterDashboardReportRowsByDate(
        cashManagementDashboard.cashInOutRows,
        cashFlowTimeRange,
        cashFlowCustomRange,
        createDashboardReportAnchorDate()
      )
      : [];
    const filteredCashInOutRows = cashManagementDashboard
      ? cashInOutBaseRows
        .filter(
          (row) =>
            !cashManagementShiftFilters.length ||
            cashManagementShiftFilters.includes(row.shift)
        )
        .filter(
          (row) =>
            !cashFlowTypeFilters.length ||
            cashFlowTypeFilters.includes(row.type)
        )
        .filter(
          (row) =>
            !cashFlowCreatedByFilters.length ||
            cashFlowCreatedByFilters.includes(row.createdBy)
        )
        .filter((row) =>
          !cashFlowSearch
            ? true
            : [row.dateTime, row.type, row.amount, row.reason, row.createdBy]
              .some((value) =>
                String(value ?? "")
                  .toLowerCase()
                  .includes(cashFlowSearch)
              )
        )
      : [];
    const sortedCashInOutRows = filteredCashInOutRows.slice().sort((left, right) => {
      const leftValue = left[cashManagementSort.key];
      const rightValue = right[cashManagementSort.key];

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return cashManagementSort.direction === "asc"
          ? leftValue - rightValue
          : rightValue - leftValue;
      }

      return cashManagementSort.direction === "asc"
        ? String(leftValue ?? "").localeCompare(String(rightValue ?? ""))
        : String(rightValue ?? "").localeCompare(String(leftValue ?? ""));
    });
    const cashDropBaseRows = cashManagementDashboard
      ? filterDashboardReportRowsByDate(
        cashManagementDashboard.cashDropRows,
        cashFlowTimeRange,
        cashFlowCustomRange,
        createDashboardReportAnchorDate()
      )
      : [];
    const filteredCashDropRows = cashManagementDashboard
      ? cashDropBaseRows
        .filter(
          (row) =>
            !cashManagementShiftFilters.length ||
            cashManagementShiftFilters.includes(row.shift)
        )
        .filter(
          (row) =>
            (!cashDropProcessedByFilters.length ||
              cashDropProcessedByFilters.includes(row.processedBy)) &&
            (!cashDropSearch ||
              [row.dateTime, row.amount, row.note, row.processedBy].some(
                (value) =>
                  String(value ?? "")
                    .toLowerCase()
                    .includes(cashDropSearch)
              ))
        )
      : [];
    const sortedCashDropRows = filteredCashDropRows.slice().sort((left, right) => {
      const leftValue = left[cashManagementSort.key];
      const rightValue = right[cashManagementSort.key];

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return cashManagementSort.direction === "asc"
          ? leftValue - rightValue
          : rightValue - leftValue;
      }

      return cashManagementSort.direction === "asc"
        ? String(leftValue ?? "").localeCompare(String(rightValue ?? ""))
        : String(rightValue ?? "").localeCompare(String(leftValue ?? ""));
    });
    const cashAuditBaseRows = cashManagementDashboard
      ? filterDashboardReportRowsByDate(
        cashManagementDashboard.cashAuditRows,
        cashFlowTimeRange,
        cashFlowCustomRange,
        createDashboardReportAnchorDate()
      )
      : [];
    const filteredCashAuditRows = cashManagementDashboard
      ? cashAuditBaseRows
        .filter(
          (row) =>
            !cashManagementShiftFilters.length ||
            cashManagementShiftFilters.includes(row.shift)
        )
        .filter(
          (row) =>
            (!cashAuditVerifiedByFilters.length ||
              cashAuditVerifiedByFilters.includes(row.verifiedBy)) &&
            (!cashAuditSearch ||
              [
                row.dateTime,
                row.expectedCash,
                row.actualCash,
                row.difference,
                row.verifiedBy,
              ].some((value) =>
                String(value ?? "")
                  .toLowerCase()
                  .includes(cashAuditSearch)
              ))
        )
      : [];
    const sortedCashAuditRows = filteredCashAuditRows.slice().sort((left, right) => {
      const leftValue = left[cashManagementSort.key];
      const rightValue = right[cashManagementSort.key];

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return cashManagementSort.direction === "asc"
          ? leftValue - rightValue
          : rightValue - leftValue;
      }

      return cashManagementSort.direction === "asc"
        ? String(leftValue ?? "").localeCompare(String(rightValue ?? ""))
        : String(rightValue ?? "").localeCompare(String(leftValue ?? ""));
    });
    const pagedCashInOutRows = getPagedRows(cashFlowPageId, sortedCashInOutRows);
    const pagedCashDropRows = getPagedRows(cashDropPageId, sortedCashDropRows);
    const pagedCashAuditRows = getPagedRows(cashAuditPageId, sortedCashAuditRows);
    const cashFlowCreatedByOptions = cashManagementDashboard
      ? createUniqueCountedFilterOptions(cashInOutBaseRows, (row) => row.createdBy)
      : [];
    const cashManagementShiftOptions = cashManagementDashboard
      ? createUniqueCountedFilterOptions(
        [...cashInOutBaseRows, ...cashDropBaseRows, ...cashAuditBaseRows],
        (row) => row.shift
      )
      : [];
    const cashDropProcessedByOptions = cashManagementDashboard
      ? createUniqueCountedFilterOptions(cashDropBaseRows, (row) => row.processedBy)
      : [];
    const cashAuditVerifiedByOptions = cashManagementDashboard
      ? createUniqueCountedFilterOptions(cashAuditBaseRows, (row) => row.verifiedBy)
      : [];
    const cashManagementTableConfig =
      cashManagementTableTab === "cash-drop"
        ? {
          title: "Cash Drop Report",
          copy: "All cash removed from the drawer and transferred to the safe.",
          pageId: cashDropPageId,
          rows: sortedCashDropRows,
          paged: pagedCashDropRows,
          sortState: cashManagementSort,
          onSort: handleSetCashManagementSort,
          searchPlaceholder: "Search cash drop",
          emptyTitle: "No cash drops match the current filters",
          emptyCopy:
            "Adjust the selected date, processed by filter, or search term to show cash drop records.",
          downloadMessage: "Cash Drop Report export downloaded",
          filters: (
            <div className="dashboard-report-module__table-filters">
              <FilterChip
                label="Shift"
                values={cashManagementShiftFilters}
                options={cashManagementShiftOptions}
                onChange={setCashManagementShiftFilters}
              />
              <FilterChip
                label="Processed By"
                values={cashDropProcessedByFilters}
                options={cashDropProcessedByOptions}
                onChange={setCashDropProcessedByFilters}
              />
            </div>
          ),
          columns: [
            { key: "dateTime", label: "Date & Time", sortable: true },
            { key: "businessUnit", label: "Entity", sortable: true },
            { key: "amount", label: "Amount", align: "right", sortable: true, sortKey: "amountValue" },
            { key: "note", label: "Note" },
            { key: "processedBy", label: "Processed By" },
          ],
        }
        : cashManagementTableTab === "cash-audit"
          ? {
            title: "Cash Drawer Audit",
            copy: "Counted cash audits with expected, actual, and difference.",
            pageId: cashAuditPageId,
            rows: sortedCashAuditRows,
            paged: pagedCashAuditRows,
            sortState: cashManagementSort,
            onSort: handleSetCashManagementSort,
            searchPlaceholder: "Search audit record",
            emptyTitle: "No cash audits match the current filters",
            emptyCopy:
              "Adjust the selected date, verified by filter, or search term to show cash audit records.",
            downloadMessage: "Cash Drawer Audit export downloaded",
            filters: (
              <div className="dashboard-report-module__table-filters">
                <FilterChip
                  label="Shift"
                  values={cashManagementShiftFilters}
                  options={cashManagementShiftOptions}
                  onChange={setCashManagementShiftFilters}
                />
                <FilterChip
                  label="Verified By"
                  values={cashAuditVerifiedByFilters}
                  options={cashAuditVerifiedByOptions}
                  onChange={setCashAuditVerifiedByFilters}
                />
              </div>
            ),
            columns: [
              { key: "dateTime", label: "Date & Time", sortable: true },
              { key: "businessUnit", label: "Entity", sortable: true },
              { key: "expectedCash", label: "Expected Cash", align: "right", sortable: true, sortKey: "expectedCashValue" },
              { key: "actualCash", label: "Actual Cash", align: "right", sortable: true, sortKey: "actualCashValue" },
              {
                key: "difference",
                label: "Difference",
                align: "right",
                sortable: true,
                sortKey: "differenceValue",
                render: (row) => (
                  <p
                    className={`dashboard-report-module__delta dashboard-report-module__delta--${row.differenceValue >= 0 ? "positive" : "negative"
                      } type-subtitle-2`}
                  >
                    {row.difference}
                  </p>
                ),
              },
              { key: "verifiedBy", label: "Verified By" },
            ],
          }
          : {
            title: "Cash In / Cash Out",
            copy:
              "Review all drawer inflow and outflow movements with filters by date and type.",
            pageId: cashFlowPageId,
            rows: sortedCashInOutRows,
            paged: pagedCashInOutRows,
            sortState: cashManagementSort,
            onSort: handleSetCashManagementSort,
            searchPlaceholder: "Search cash movement",
            emptyTitle: "No cash movement matches the current filters",
            emptyCopy:
              "Adjust the selected date, type, created by filter, or search term to show drawer movement records.",
            downloadMessage: "Cash In / Cash Out export downloaded",
            filters: (
              <div className="dashboard-report-module__table-filters">
                <FilterChip
                  label="Shift"
                  values={cashManagementShiftFilters}
                  options={cashManagementShiftOptions}
                  onChange={setCashManagementShiftFilters}
                />
                <FilterChip
                  label="Type"
                  values={cashFlowTypeFilters}
                  options={createCountedFilterOptions(
                    ["Cash In", "Cash Out"],
                    cashInOutBaseRows,
                    (row) => row.type
                  )}
                  onChange={setCashFlowTypeFilters}
                />
                <FilterChip
                  label="Created By"
                  values={cashFlowCreatedByFilters}
                  options={cashFlowCreatedByOptions}
                  onChange={setCashFlowCreatedByFilters}
                />
              </div>
            ),
            columns: [
              { key: "dateTime", label: "Date & Time", sortable: true },
              { key: "businessUnit", label: "Entity", sortable: true },
              { key: "type", label: "Type" },
              {
                key: "amount",
                label: "Amount",
                align: "right",
                sortable: true,
                sortKey: "amountValue",
                render: (row) => (
                  <p
                    className={`dashboard-report-module__delta dashboard-report-module__delta--${row.type === "Cash In" ? "positive" : "negative"
                      } type-subtitle-2`}
                  >
                    {row.amount}
                  </p>
                ),
              },
              { key: "reason", label: "Reason" },
              { key: "createdBy", label: "Created By" },
            ],
          };

    function handleDashboardModulePageChange(pageId, nextPage, totalPages) {
      setPageByPage((previous) => ({
        ...previous,
        [pageId]: Math.min(Math.max(nextPage, 1), totalPages),
      }));
    }

    function renderDashboardModuleTableCard({
      title,
      copy,
      tabStrip = null,
      headerActions = null,
      hideHeader = false,
      panelClassName = "",
      filters = null,
      columns,
      rows,
      paged,
      pageId,
      sortState,
      onSort,
      searchPlaceholder,
      emptyTitle = "No rows match the current filters",
      emptyCopy = "Adjust the selected filters or search term to show data.",
      downloadMessage,
    }) {
      return (
        <section
          className={`table-card dashboard-report-module__table-panel${panelClassName ? ` ${panelClassName}` : ""
            }`}
        >
          {tabStrip ? (
            tabStrip
          ) : !hideHeader ? (
            <div className="surface-panel__header">
              <div className="surface-panel__title-group">
                <p className="surface-panel__title type-headline">{title}</p>
                <p className="surface-panel__copy type-subtitle-2 text-secondary">
                  {copy}
                </p>
              </div>
              {headerActions}
            </div>
          ) : null}
          <TableToolbar
            filters={filters}
            searchPlaceholder={searchPlaceholder}
            searchValue={searchByPage[pageId] ?? ""}
            onSearch={(value) => handleSetSearch(pageId, value)}
          />
          {rows.length ? (
            <div
              className="table-scroll dashboard-report-module__table-scroll"
              data-max-height="400"
              data-scroll-top="false"
              onScroll={handleTableCardScroll}
            >
              <table className="lab-table">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={
                          column.align === "right" ? "is-right" : undefined
                        }
                      >
                        {column.sortable && sortState && onSort ? (
                          <button
                            type="button"
                            className={`dashboard-table-sort type-title-3${(column.sortKey ?? column.key) === sortState.key
                              ? " is-active"
                              : ""
                              }`}
                            onClick={() =>
                              onSort(column.sortKey ?? column.key)
                            }
                          >
                            <span>{column.label}</span>
                            <span
                              className="dashboard-table-sort__icon"
                              aria-hidden="true"
                            >
                              <ChevronIcon
                                name="filterChevron"
                                size={16}
                                color="#C2C2C2"
                                direction={
                                  (column.sortKey ?? column.key) ===
                                    sortState.key &&
                                    sortState.direction === "desc"
                                    ? "up"
                                    : "down"
                                }
                              />
                            </span>
                          </button>
                        ) : (
                          <p className="type-title-3">{column.label}</p>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.rows.map((row) => (
                    <tr key={row.id}>
                      {columns.map((column) => (
                        <td
                          key={`${row.id}-${column.key}`}
                          className={
                            column.align === "right" ? "is-right" : undefined
                          }
                        >
                          {column.render ? (
                            column.render(row)
                          ) : (
                            <p
                              className={`type-subtitle-2${column.contentClassName
                                ? ` ${column.contentClassName}`
                                : ""
                                }`}
                            >
                              {row[column.key] ?? "-"}
                            </p>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dashboard-report-detail__empty">
              <EmptyState title={emptyTitle} copy={emptyCopy} />
            </div>
          )}
          <TableFooterBar
            page={paged.page}
            totalPages={paged.totalPages}
            rowsPerPage={rowsPerPage[pageId] || 25}
            totalRows={rows.length}
            onRowsChange={(value) => handleSetRowsPerPage(pageId, value)}
            onPrev={() =>
              handleDashboardModulePageChange(
                pageId,
                paged.page - 1,
                paged.totalPages
              )
            }
            onNext={() =>
              handleDashboardModulePageChange(
                pageId,
                paged.page + 1,
                paged.totalPages
              )
            }
            onSelectPage={(value) =>
              handleDashboardModulePageChange(pageId, value, paged.totalPages)
            }
            onDownload={() => showSnackbar(downloadMessage, "green")}
          />
        </section>
      );
    }

    const businessUnitDashboardContent = selectedSidebarBusinessUnit
      ? {
        "sales-report": {
          title: "Sales Report Overview",
          copy: `Track gross sales, order flow, and average check performance for ${selectedSidebarBusinessUnit.name}.`,
          metrics: [
            ["Gross Sales", formatIdr(18450000), "brand"],
            ["Transactions", 286, "neutral"],
            ["Avg. Ticket", formatIdr(64500), "success"],
          ],
          highlights: [
            [
              "Peak hour contribution",
              "Lunch service contributed 38% of today's revenue with the highest dine-in conversion.",
              "12:00 - 14:00",
            ],
            [
              "Top selling menu",
              "Burger Supreme remained the top grossing catalog item across dine-in and pickup orders.",
              "Main Course",
            ],
            [
              "Channel mix",
              "Delivery sales accounted for 24% of total sales with stable average ticket value.",
              "Delivery",
            ],
          ],
          notes: [
            [
              "Menu mix alert",
              "Dessert attach rate is under target and should be reviewed for bundle opportunities.",
              "orange",
            ],
            [
              "Sales rhythm",
              "Afternoon tea hours remain stable and can support promotional upsell tests.",
              "blue",
            ],
          ],
          actions: [
            [
              "Update upsell script",
              "Brief the cashier team on beverage pairing prompts during late lunch traffic.",
              "Operations",
            ],
            [
              "Review bundle pricing",
              "Compare combo conversion against the prior seven-day average before tomorrow's promo sync.",
              "Pricing",
            ],
            [
              "Refine best seller set",
              "Highlight Burger Supreme and Iced Coffee as the lead combo on the RMS home banner.",
              "Catalog",
            ],
          ],
        },
        "discount-report": {
          title: "Discount Performance",
          copy: `Monitor promotional usage, manual discounts, and margin impact for ${selectedSidebarBusinessUnit.name}.`,
          metrics: [
            ["Discount Value", formatIdr(1260000), "brand"],
            ["Discounted Orders", 54, "neutral"],
            ["Margin Impact", "6.8%", "danger"],
          ],
          highlights: [
            [
              "Promo leader",
              "Happy Hour Beverage delivered the largest volume but reduced beverage margin more than planned.",
              "Promo",
            ],
            [
              "Manual override usage",
              "Manager-led manual discounts were concentrated in dinner service and should be audited.",
              "Manager Override",
            ],
            [
              "Voucher redemption",
              "Digital voucher redemption held steady with no unusual stacking behavior detected.",
              "Voucher",
            ],
          ],
          notes: [
            [
              "Policy reminder",
              "Manual discounts above 10% should be matched against shift manager approval logs.",
              "orange",
            ],
            [
              "Optimization",
              "Bundle-driven discounts are converting better than flat-value vouchers on weekdays.",
              "blue",
            ],
          ],
          actions: [
            [
              "Audit manual discounts",
              "Review dinner-shift overrides and validate supporting notes before closing the day.",
              "Compliance",
            ],
            [
              "Refine voucher cap",
              "Adjust voucher caps for low-margin beverages before the next campaign window.",
              "Marketing",
            ],
            [
              "Compare promo ROI",
              "Benchmark Happy Hour Beverage performance against target labor and food cost ratios.",
              "Finance",
            ],
          ],
        },
        "payment-report": {
          title: "Payment Report Summary",
          copy: `Track tender mix, settlement speed, and payment exceptions across RMS transactions.`,
          metrics: [
            ["Card Payments", formatIdr(9725000), "brand"],
            ["Cash Payments", formatIdr(4380000), "neutral"],
            ["Failed Settlements", 3, "danger"],
          ],
          highlights: [
            [
              "Tender concentration",
              "Card transactions represented 53% of total settlement value with stable processing time.",
              "Card",
            ],
            [
              "Cash handling",
              "Cash volume remains elevated during lunch due to office walk-in traffic.",
              "Cash",
            ],
            [
              "Settlement issue",
              "Three QRIS transactions require reconciliation with the payment gateway batch report.",
              "Exception",
            ],
          ],
          notes: [
            [
              "Gateway watch",
              "QRIS latency increased slightly after 14:00 but remained within acceptable service levels.",
              "orange",
            ],
            [
              "Settlement health",
              "Card settlement batches were pushed successfully to RMS with no missing receipts.",
              "blue",
            ],
          ],
          actions: [
            [
              "Reconcile failed settlements",
              "Cross-check QRIS references against the gateway portal before end-of-day close.",
              "Finance",
            ],
            [
              "Review cash float",
              "Confirm cash drawer float after the elevated lunch cash intake.",
              "Cashier",
            ],
            [
              "Validate receipt sync",
              "Ensure all payment receipts were sent to the connected RMS audit stream.",
              "Support",
            ],
          ],
        },
        "cash-management": {
          title: "Cash Management",
          copy: `Review drawer opening balance, cash movement, and closing variance for ${selectedSidebarBusinessUnit.name}.`,
          metrics: [
            ["Opening Float", formatIdr(1500000), "neutral"],
            ["Cash In Drawer", formatIdr(4960000), "brand"],
            ["Variance", formatIdr(25000), "danger"],
          ],
          highlights: [
            [
              "Shift handover",
              "Midday handover matched expected float and required no manual adjustment.",
              "Shift",
            ],
            [
              "Paid out items",
              "Minor petty cash was issued for packaging replenishment during the afternoon shift.",
              "Paid Out",
            ],
            [
              "Variance tracking",
              "Current drawer variance is within threshold but still needs end-of-shift acknowledgement.",
              "Variance",
            ],
          ],
          notes: [
            [
              "Variance alert",
              "A small cash variance remains open and should be cleared before the closing checklist is signed.",
              "orange",
            ],
            [
              "Cash discipline",
              "Cash-in and paid-out entries are being logged consistently in RMS for this unit.",
              "blue",
            ],
          ],
          actions: [
            [
              "Close variance note",
              "Attach supporting evidence for the open drawer variance before final settlement approval.",
              "Cashier",
            ],
            [
              "Verify paid out reason",
              "Confirm petty cash expense coding for packaging replenishment.",
              "Operations",
            ],
            [
              "Prepare close report",
              "Generate a shift close summary once the evening cashier takes over the drawer.",
              "Shift Close",
            ],
          ],
        },
        "refund-void-loss-report": {
          title: "Refund / VOID / Loss Summary",
          copy: `Watch refund, void, and loss events to keep RMS controls and approval flows healthy.`,
          metrics: [
            ["Refund Value", formatIdr(285000), "neutral"],
            ["VOID Count", 7, "danger"],
            ["Loss Events", 2, "brand"],
          ],
          highlights: [
            [
              "Refund pattern",
              "Refunds were concentrated in delivery orders affected by delayed beverage preparation.",
              "Refund",
            ],
            [
              "VOID approval",
              "Most voided items came from modifier mismatch corrections during lunch rush.",
              "VOID",
            ],
            [
              "Recorded loss",
              "Two wastage events were recorded for desserts due to holding-time expiry.",
              "Loss",
            ],
          ],
          notes: [
            [
              "Control watch",
              "Repeated lunch-time voids may indicate a workflow issue in modifier confirmation.",
              "orange",
            ],
            [
              "Audit trail",
              "Refund approvals remain fully logged and traceable in the RMS audit history.",
              "blue",
            ],
          ],
          actions: [
            [
              "Review void reasons",
              "Inspect modifier mismatch voids and tighten cashier confirmation steps.",
              "Operations",
            ],
            [
              "Follow refund trend",
              "Compare delivery refund causes against kitchen prep delays for the last three days.",
              "Delivery",
            ],
            [
              "Minimize wastage",
              "Adjust dessert prep quantity during slower shoulder hours to reduce expiry losses.",
              "Inventory",
            ],
          ],
        },
        "inventory-report": {
          title: "Inventory Report",
          copy: `Track stock movement, waste, and replenishment pressure on RMS-linked menu items.`,
          metrics: [
            ["Critical SKUs", 4, "danger"],
            ["Stock Value", formatIdr(7630000), "brand"],
            ["Waste Rate", "1.9%", "neutral"],
          ],
          highlights: [
            [
              "Low stock warning",
              "Cheddar slices and burger buns are both near reorder threshold for tomorrow's service.",
              "Critical",
            ],
            [
              "Waste pattern",
              "Fresh greens waste eased after tightening prep batches in the morning shift.",
              "Waste",
            ],
            [
              "Receiving status",
              "Today's dairy replenishment was posted successfully and synced to RMS inventory balances.",
              "Receiving",
            ],
          ],
          notes: [
            [
              "Stock alert",
              "Critical burger ingredients should be reordered before breakfast prep begins tomorrow.",
              "orange",
            ],
            [
              "Inventory sync",
              "All receiving records are currently aligned with the catalog cost basis in RMS.",
              "blue",
            ],
          ],
          actions: [
            [
              "Trigger reorder",
              "Create a purchase request for cheddar slices and burger buns immediately.",
              "Procurement",
            ],
            [
              "Check par levels",
              "Review tomorrow's par settings against expected promo demand.",
              "Inventory",
            ],
            [
              "Validate waste notes",
              "Ensure every wastage entry includes a root-cause note before the nightly audit.",
              "Audit",
            ],
          ],
        },
        "financial-report": {
          title: "Financial Report",
          copy: `Review profitability, cost pressure, and closing health for ${selectedSidebarBusinessUnit.name}.`,
          metrics: [
            ["Net Sales", formatIdr(16890000), "brand"],
            ["COGS Ratio", "31.4%", "neutral"],
            ["Gross Margin", "68.6%", "success"],
          ],
          highlights: [
            [
              "Margin health",
              "Gross margin held above target despite discount activity during the afternoon window.",
              "Margin",
            ],
            [
              "Cost pressure",
              "Protein-heavy mains remain the largest contributor to COGS variance for this unit.",
              "COGS",
            ],
            [
              "Close status",
              "Pre-close reconciliation is on track with only one pending variance review item.",
              "Closing",
            ],
          ],
          notes: [
            [
              "Finance watch",
              "Track protein cost trends before finalizing next week's pricing update proposal.",
              "orange",
            ],
            [
              "Closing health",
              "The unit is on track for a clean close if the remaining cash variance is resolved.",
              "blue",
            ],
          ],
          actions: [
            [
              "Prepare variance review",
              "Summarize the remaining financial exceptions before sign-off by the closing supervisor.",
              "Closing",
            ],
            [
              "Review COGS drivers",
              "Compare protein cost movement against the current menu engineering assumptions.",
              "Finance",
            ],
            [
              "Publish unit snapshot",
              "Share the end-of-day financial summary with the area manager once close is complete.",
              "Reporting",
            ],
          ],
        },
      }
      : null;

    if (dashboardReportTab === "sales-report" && salesReportDashboard) {
      return (
        <section className={dashboardPageClassName}>
          <div className="dashboard-page-sticky">
            <PageHeader title="Dashboard" className="page-header--dashboard" />
            {isLockedSelectedBusinessUnit ? (
              <div className="dashboard-page-sticky__banner">
                {renderLockedBusinessUnitInfoBox()}
              </div>
            ) : null}
            <div className="dashboard-page-sticky__tabs dashboard-page-sticky__tabs--with-control">
              <div className="dashboard-report-tabs" role="tablist">
                {businessUnitDashboardTabs.map((tab) => (
                  <DashboardReportTabButton
                    key={tab.id}
                    label={tab.label}
                    active={dashboardReportTab === tab.id}
                    onClick={() => setDashboardReportTab(tab.id)}
                  />
                ))}
              </div>
              <div className="dashboard-page-sticky__controls">
                {shouldShowDashboardBusinessUnitFilter ? (
                  <SingleSelectFilterChip
                    label="Entity"
                    value={dashboardBusinessUnitFilter}
                    options={dashboardBusinessUnitOptions}
                    onChange={handleSetDashboardBusinessUnitFilter}
                  />
                ) : null}
                <SingleSelectFilterChip
                  label="Time Period"
                  value={salesBreakdownTimeRange}
                  options={DASHBOARD_REPORT_TIME_RANGE_OPTIONS}
                  onChange={handleSetSalesBreakdownTimeRange}
                  align="end"
                  customDateRange={salesBreakdownCustomRange}
                  onCustomDateChange={handleSetSalesBreakdownCustomDate}
                />
              </div>
            </div>
          </div>
          <div className="page-body">
            <div className="dashboard-kpi-summary">
              <DashboardKpiSummaryPrimaryCard
                metrics={["total-sales", "total-orders", "profit"]
                  .map((id) =>
                    salesReportDashboard.kpis.find((kpi) => kpi.id === id)
                  )
                  .filter(Boolean)}
                onViewReport={handleOpenDashboardReportDetail}
              />
              <div className="dashboard-kpi-summary__secondary">
                {[
                  "average-order-value",
                  "discount-summary",
                  "tax-collected",
                  "refund-transaction",
                  "void-transaction",
                  "cancelled-orders",
                ]
                  .map((id) =>
                    salesReportDashboard.kpis.find((kpi) => kpi.id === id)
                  )
                  .filter(Boolean)
                  .map((kpi) => (
                    <DashboardKpiCard
                      key={kpi.id}
                      label={kpi.label}
                      value={kpi.value}
                      valuePrimary={kpi.valuePrimary}
                      valueSecondary={kpi.valueSecondary}
                      trendLabel={kpi.trendLabel}
                      trendCopy={kpi.trendCopy}
                      trendSecondaryCopy={kpi.trendSecondaryCopy}
                      trendTone={kpi.trendTone}
                      onViewReport={() =>
                        handleOpenDashboardReportDetail(kpi.id)
                      }
                    />
                  ))}
              </div>
            </div>
            <div className="dashboard-sales-overview-grid">
              {activeSalesSummaryPanel ? (
                <DashboardLineChartPanel
                  title={activeSalesSummaryPanel.title}
                  copy={activeSalesSummaryPanel.copy}
                  yAxisFormatter={(value) =>
                    formatSalesSummaryAxisValue(salesSummaryMetric, value)
                  }
                  headerActions={
                    <DashboardViewModeTabs
                      value={salesSummaryMode}
                      onChange={setSalesSummaryMode}
                    />
                  }
                  comparisonFields={
                    salesSummaryMode === "comparison" ? (
                      <>
                        <DashboardInlineSelect
                          value={String(
                            activeSalesSummaryComparisonSelection.current
                          )}
                          options={activeSalesSummaryComparisonOptions}
                          onChange={(value) =>
                            handleChangeSalesSummaryComparisonSelection(
                              "current",
                              value
                            )
                          }
                          ariaLabel="Select current comparison period"
                        />
                        <p className="type-body text-secondary">vs</p>
                        <DashboardInlineSelect
                          value={String(
                            activeSalesSummaryComparisonSelection.compare
                          )}
                          options={activeSalesSummaryComparisonOptions}
                          onChange={(value) =>
                            handleChangeSalesSummaryComparisonSelection(
                              "compare",
                              value
                            )
                          }
                          ariaLabel="Select comparison reference period"
                        />
                      </>
                    ) : null
                  }
                  legendItems={getSalesSummaryMetricLegendItems()}
                  selectedLegendId={salesSummaryMetric}
                  onLegendSelect={setSalesSummaryMetric}
                  tabs={SALES_SUMMARY_RANGE_TABS}
                  activeTab={salesSummaryRange}
                  onTabSelect={setSalesSummaryRange}
                  navigationLabel={
                    salesSummaryMode === "trend"
                      ? activeSalesSummaryPanel.navigationLabel
                      : ""
                  }
                  onNavigatePrev={
                    salesSummaryMode === "trend"
                      ? () => handleNavigateSalesSummary("prev")
                      : null
                  }
                  onNavigateNext={
                    salesSummaryMode === "trend"
                      ? () => handleNavigateSalesSummary("next")
                      : null
                  }
                  canNavigateNext={
                    salesSummaryMode === "trend" && activeSalesSummaryOffset > 0
                  }
                  reverseTimeline
                  stats={activeSalesSummaryPanel.stats}
                  labels={activeSalesSummaryPanel.labels}
                  datasets={activeSalesSummaryPanel.datasets}
                />
              ) : null}
              {activeSalesBreakdownTab ? (
                <DashboardBreakdownSummaryCard
                  title={salesBreakdownSummary.title}
                  copy={salesBreakdownSummary.copy}
                  tabs={salesBreakdownTabs}
                  activeTab={activeSalesBreakdownTab.id}
                  onTabSelect={setSalesBreakdownTab}
                  totalSalesDisplayValue={
                    salesBreakdownSummary.totalSalesDisplayValue
                  }
                  totalOrdersDisplayValue={
                    salesBreakdownSummary.totalOrdersDisplayValue
                  }
                  headerActions={
                    <button
                      type="button"
                      className="dashboard-kpi-card__link type-body-bold"
                      onClick={() =>
                        handleOpenSalesBreakdownDetail(activeSalesBreakdownTab.id)
                      }
                    >
                      View Detail
                    </button>
                  }
                />
              ) : null}
            </div>
          </div>
        </section>
      );
    }

    if (
      dashboardReportTab === "inventory-report" &&
      inventoryReportDashboard &&
      activeInventoryDashboardTab
    ) {
      return (
        <section className={dashboardPageClassName}>
          <div className="dashboard-page-sticky">
            <PageHeader title="Dashboard" className="page-header--dashboard" />
            {isLockedSelectedBusinessUnit ? (
              <div className="dashboard-page-sticky__banner">
                {renderLockedBusinessUnitInfoBox()}
              </div>
            ) : null}
            <div className="dashboard-page-sticky__tabs dashboard-page-sticky__tabs--with-control">
              <div className="dashboard-report-tabs" role="tablist">
                {businessUnitDashboardTabs.map((tab) => (
                  <DashboardReportTabButton
                    key={tab.id}
                    label={tab.label}
                    active={dashboardReportTab === tab.id}
                    onClick={() => setDashboardReportTab(tab.id)}
                  />
                ))}
              </div>
              <div className="dashboard-page-sticky__controls">
                {shouldShowDashboardBusinessUnitFilter ? (
                  <SingleSelectFilterChip
                    label="Entity"
                    value={dashboardBusinessUnitFilter}
                    options={dashboardBusinessUnitOptions}
                    onChange={handleSetDashboardBusinessUnitFilter}
                  />
                ) : null}
              </div>
            </div>
          </div>
          <div className="page-body page-body--report-detail dashboard-report-detail__page-body dashboard-report-detail__page-body--inventory">
            <div className="dashboard-report-detail__overview dashboard-report-detail__overview--inventory">
              <div className="dashboard-report-detail__metric-grid dashboard-report-detail__metric-grid--inventory">
                {inventoryReportDashboard.metrics.map((metric) => (
                  <DashboardStackedMetricCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.count}
                    tone={metric.tone}
                    iconName={metric.iconName}
                  />
                ))}
              </div>
              <DashboardInventoryProgressCard
                title={inventoryReportDashboard.progress?.title ?? "Inventory"}
                copy={inventoryReportDashboard.progress?.copy ?? ""}
                ingredients={inventoryReportDashboard.progress?.ingredients ?? []}
              />
            </div>
            <section className="table-card dashboard-report-detail__table-card dashboard-report-module__table-panel dashboard-report-module__table-panel--flush">
              <div className="dashboard-report-module__table-top-controls">
                <div
                  className="dashboard-report-module__table-top-tabs"
                  role="tablist"
                >
                  {inventoryReportDashboard.tabs.map((tab) => (
                    <DashboardDetailTabButton
                      key={tab.id}
                      label={tab.label}
                      active={activeInventoryDashboardTab.id === tab.id}
                      onClick={() => handleSetInventoryDashboardTab(tab.id)}
                    />
                  ))}
                </div>
              </div>
              <TableToolbar
                filters={
                  <div className="dashboard-report-detail__toolbar-start">
                    <FilterChip
                      label="Category"
                      values={inventoryDashboardFilters.category}
                      options={inventoryCategoryOptions}
                      onChange={(value) =>
                        handleSetInventoryDashboardFilter("category", value)
                      }
                    />
                    <FilterChip
                      label="Ingredients"
                      values={inventoryDashboardFilters.ingredient}
                      options={inventoryIngredientOptions}
                      onChange={(value) =>
                        handleSetInventoryDashboardFilter("ingredient", value)
                      }
                    />
                    {activeInventoryDashboardTab.id === "stock-level" ? (
                      <FilterChip
                        label="Status"
                        values={inventoryDashboardFilters.status}
                        options={inventoryStatusOptions}
                        onChange={(value) =>
                          handleSetInventoryDashboardFilter("status", value)
                        }
                      />
                    ) : null}
                    {activeInventoryDashboardTab.id === "stock-movement" ? (
                      <FilterChip
                        label="Type"
                        values={inventoryDashboardFilters.movementType}
                        options={inventoryMovementTypeOptions}
                        onChange={(value) =>
                          handleSetInventoryDashboardFilter(
                            "movementType",
                            value
                          )
                        }
                      />
                    ) : null}
                    {activeInventoryDashboardTab.id === "stock-movement" ? (
                      <FilterChip
                        label="Updated By"
                        values={inventoryDashboardFilters.updatedBy}
                        options={inventoryUpdatedByOptions}
                        onChange={(value) =>
                          handleSetInventoryDashboardFilter("updatedBy", value)
                        }
                      />
                    ) : null}
                  </div>
                }
                searchPlaceholder={activeInventoryDashboardTab.searchPlaceholder}
                searchValue={searchByPage[inventoryDashboardPageId] ?? ""}
                onSearch={(value) =>
                  handleSetSearch(inventoryDashboardPageId, value)
                }
              />
              {sortedInventoryDashboardRows.length ? (
                <div
                  className="table-scroll dashboard-report-module__table-scroll"
                  data-max-height="400"
                  data-scroll-top="false"
                  onScroll={handleTableCardScroll}
                >
                  <table className="lab-table">
                    <thead>
                      <tr>
                        {scopedInventoryDashboardColumns.map((column) => (
                          <th
                            key={column.key}
                            className={
                              column.align === "right" ? "is-right" : undefined
                            }
                          >
                            {column.sortable ? (
                              <button
                                type="button"
                                className={`dashboard-table-sort type-title-3${(column.sortKey ?? column.key) ===
                                  inventoryReportSort.key
                                  ? " is-active"
                                  : ""
                                  }`}
                                onClick={() =>
                                  handleSetInventoryReportSort(
                                    column.sortKey ?? column.key
                                  )
                                }
                              >
                                <span>{column.label}</span>
                                <span
                                  className="dashboard-table-sort__icon"
                                  aria-hidden="true"
                                >
                                  <ChevronIcon
                                    name="filterChevron"
                                    size={16}
                                    color="#C2C2C2"
                                    direction={
                                      (column.sortKey ?? column.key) ===
                                        inventoryReportSort.key &&
                                        inventoryReportSort.direction === "desc"
                                        ? "up"
                                        : "down"
                                    }
                                  />
                                </span>
                              </button>
                            ) : (
                              <p className="type-title-3">{column.label}</p>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedInventoryDashboardRows.rows.map((row) => (
                        <tr key={row.id}>
                          {scopedInventoryDashboardColumns.map((column) => (
                            <td
                              key={`${row.id}-${column.key}`}
                              className={
                                column.align === "right"
                                  ? "is-right"
                                  : undefined
                              }
                            >
                              {column.type === "status" ? (
                                <StatusPill status={row[column.key] ?? "-"} />
                              ) : column.render ? (
                                column.render(row)
                              ) : (
                                <p
                                  className={`type-subtitle-2${column.contentClassName
                                    ? ` ${column.contentClassName}`
                                    : ""
                                    }`}
                                >
                                  {row[column.key] ?? "-"}
                                </p>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="dashboard-report-detail__empty">
                  <EmptyState
                    title="No inventory rows match the current filters"
                    copy="Adjust the selected filters or search term to show inventory data."
                  />
                </div>
              )}
              <TableFooterBar
                page={pagedInventoryDashboardRows.page}
                totalPages={pagedInventoryDashboardRows.totalPages}
                rowsPerPage={rowsPerPage[inventoryDashboardPageId] || 25}
                totalRows={sortedInventoryDashboardRows.length}
                onRowsChange={(value) =>
                  handleSetRowsPerPage(inventoryDashboardPageId, value)
                }
                onPrev={() =>
                  handleDashboardModulePageChange(
                    inventoryDashboardPageId,
                    pagedInventoryDashboardRows.page - 1,
                    pagedInventoryDashboardRows.totalPages
                  )
                }
                onNext={() =>
                  handleDashboardModulePageChange(
                    inventoryDashboardPageId,
                    pagedInventoryDashboardRows.page + 1,
                    pagedInventoryDashboardRows.totalPages
                  )
                }
                onSelectPage={(value) =>
                  handleDashboardModulePageChange(
                    inventoryDashboardPageId,
                    value,
                    pagedInventoryDashboardRows.totalPages
                  )
                }
                onDownload={() =>
                  showSnackbar("Inventory Report export downloaded", "green")
                }
              />
            </section>
          </div>
        </section>
      );
    }

    if (dashboardReportTab === "cash-management" && cashManagementDashboard) {
      return (
        <section
          className={`${dashboardPageClassName} dashboard-page--cash-management`}
        >
          <div className="dashboard-page-sticky">
            <PageHeader title="Dashboard" className="page-header--dashboard" />
            {isLockedSelectedBusinessUnit ? (
              <div className="dashboard-page-sticky__banner">
                {renderLockedBusinessUnitInfoBox()}
              </div>
            ) : null}
            <div className="dashboard-page-sticky__tabs dashboard-page-sticky__tabs--with-control">
              <div className="dashboard-report-tabs" role="tablist">
                {businessUnitDashboardTabs.map((tab) => (
                  <DashboardReportTabButton
                    key={tab.id}
                    label={tab.label}
                    active={dashboardReportTab === tab.id}
                    onClick={() => setDashboardReportTab(tab.id)}
                  />
                ))}
              </div>
              <div className="dashboard-page-sticky__controls">
                {shouldShowDashboardBusinessUnitFilter ? (
                  <SingleSelectFilterChip
                    label="Entity"
                    value={dashboardBusinessUnitFilter}
                    options={dashboardBusinessUnitOptions}
                    onChange={handleSetDashboardBusinessUnitFilter}
                  />
                ) : null}
                <SingleSelectFilterChip
                  label="Time Period"
                  value={cashFlowTimeRange}
                  options={DASHBOARD_REPORT_TIME_RANGE_OPTIONS}
                  onChange={handleSetCashFlowTimeRange}
                  align="end"
                  customDateRange={cashFlowCustomRange}
                  onCustomDateChange={handleSetCashFlowCustomDate}
                />
              </div>
            </div>
          </div>
          <div className="page-body">
            <div className="dashboard-report-module__stats-stack">
              <div className="dashboard-report-module__stats-grid dashboard-report-module__stats-grid--three">
                {cashManagementDashboard.summaryCards.slice(0, 3).map((metric) => (
                  <DashboardStackedMetricCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    tone={metric.tone}
                    iconName={metric.iconName}
                  />
                ))}
              </div>
              <div className="dashboard-report-module__stats-grid dashboard-report-module__stats-grid--three">
                {cashManagementDashboard.summaryCards.slice(3, 6).map((metric) => (
                  <DashboardStackedMetricCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    tone={metric.tone}
                    iconName={metric.iconName}
                  />
                ))}
              </div>
            </div>
            {renderDashboardModuleTableCard({
              title: cashManagementTableConfig.title,
              copy: cashManagementTableConfig.copy,
              panelClassName: "dashboard-report-module__table-panel--flush",
              tabStrip: (
                <div className="dashboard-report-module__table-top-controls">
                  <div
                    className="dashboard-report-module__table-top-tabs"
                    role="tablist"
                  >
                    <DashboardDetailTabButton
                      label="Cash In / Cash Out"
                      active={cashManagementTableTab === "cash-flow"}
                      onClick={() => setCashManagementTableTab("cash-flow")}
                    />
                    <DashboardDetailTabButton
                      label="Cash Drop Report"
                      active={cashManagementTableTab === "cash-drop"}
                      onClick={() => setCashManagementTableTab("cash-drop")}
                    />
                    <DashboardDetailTabButton
                      label="Cash Drawer Audit"
                      active={cashManagementTableTab === "cash-audit"}
                      onClick={() => setCashManagementTableTab("cash-audit")}
                    />
                  </div>
                </div>
              ),
              filters: cashManagementTableConfig.filters,
              columns: getDashboardScopedColumns(
                cashManagementTableConfig.columns,
                shouldHideBusinessUnitDashboardColumns
              ),
              rows: cashManagementTableConfig.rows,
              paged: cashManagementTableConfig.paged,
              pageId: cashManagementTableConfig.pageId,
              searchPlaceholder: cashManagementTableConfig.searchPlaceholder,
              emptyTitle: cashManagementTableConfig.emptyTitle,
              emptyCopy: cashManagementTableConfig.emptyCopy,
              downloadMessage: cashManagementTableConfig.downloadMessage,
            })}
          </div>
        </section>
      );
    }

    if (dashboardReportTab === "financial-report" && financialReportDashboard) {
      return (
        <section className={dashboardPageClassName}>
          <div className="dashboard-page-sticky">
            <PageHeader title="Dashboard" className="page-header--dashboard" />
            {isLockedSelectedBusinessUnit ? (
              <div className="dashboard-page-sticky__banner">
                {renderLockedBusinessUnitInfoBox()}
              </div>
            ) : null}
            <div className="dashboard-page-sticky__tabs dashboard-page-sticky__tabs--with-control">
              <div className="dashboard-report-tabs" role="tablist">
                {businessUnitDashboardTabs.map((tab) => (
                  <DashboardReportTabButton
                    key={tab.id}
                    label={tab.label}
                    active={dashboardReportTab === tab.id}
                    onClick={() => setDashboardReportTab(tab.id)}
                  />
                ))}
              </div>
              <div className="dashboard-page-sticky__controls">
                {shouldShowDashboardBusinessUnitFilter ? (
                  <SingleSelectFilterChip
                    label="Entity"
                    value={dashboardBusinessUnitFilter}
                    options={dashboardBusinessUnitOptions}
                    onChange={handleSetDashboardBusinessUnitFilter}
                  />
                ) : null}
                <SingleSelectFilterChip
                  label="Time Period"
                  value={financialReportTimeRange}
                  options={DASHBOARD_REPORT_TIME_RANGE_OPTIONS}
                  onChange={handleSetFinancialReportTimeRange}
                  align="end"
                  customDateRange={financialReportCustomRange}
                  onCustomDateChange={handleSetFinancialReportCustomDate}
                />
              </div>
            </div>
          </div>
          <div className="page-body">
            <div className="dashboard-financial-grid">
              {financialReportDashboard.summaryCards.map((card) => (
                <DashboardFinancialSummaryCard
                  key={card.id}
                  title={card.title}
                  value={card.value}
                  valueTone={card.valueTone}
                  badgeText={card.badgeText}
                  badgeTone={card.badgeTone}
                  detailRows={card.detailRows}
                />
              ))}
            </div>
            <section className="dashboard-report-module__finance-stack">
              <div className="surface-panel__header">
                <div className="surface-panel__title-group">
                  <p className="surface-panel__title type-headline">
                    Expense Details
                  </p>
                  <p className="surface-panel__copy type-subtitle-2 text-secondary">
                    A detailed breakdown of operational costs.
                  </p>
                </div>
              </div>
              {renderDashboardModuleTableCard({
                hideHeader: true,
                panelClassName: "dashboard-report-module__table-panel--flush",
                filters: (
                  <FilterChip
                    label="Category"
                    values={financialExpenseCategoryFilters}
                    options={financialExpenseCategoryOptions}
                    onChange={setFinancialExpenseCategoryFilters}
                  />
                ),
                columns: getDashboardScopedColumns(
                  [
                    { key: "date", label: "Date", sortable: true },
                    { key: "businessUnit", label: "Entity", sortable: true },
                    {
                      key: "expenseCategory",
                      label: "Category",
                      render: (row) => (
                        <span className="status-pill status-pill--muted">
                          <span className="type-body">{row.expenseCategory}</span>
                        </span>
                      ),
                    },
                    { key: "description", label: "Description" },
                    { key: "createdBy", label: "Created By" },
                    { key: "amount", label: "Amount", align: "right", sortable: true, sortKey: "amountValue" },
                  ],
                  shouldHideBusinessUnitDashboardColumns
                ),
                rows: sortedFinancialExpenseRows,
                paged: pagedFinancialExpenseRows,
                sortState: financialReportSort,
                onSort: handleSetFinancialReportSort,
                pageId: financialExpensePageId,
                searchPlaceholder: "Search categories...",
                emptyTitle: "No expense rows match the current filters",
                emptyCopy:
                  "Adjust the selected time period, category filter, or search term to show expense records.",
                downloadMessage: "Expense Report export downloaded",
              })}
            </section>
          </div>
        </section>
      );
    }

    if (
      selectedSidebarBusinessUnit &&
      dashboardReportTab === "discount-report" &&
      discountReport
    ) {
      return (
        <section className={dashboardPageClassName}>
          <div className="dashboard-page-sticky">
            <PageHeader title="Dashboard" className="page-header--dashboard" />
            {isLockedSelectedBusinessUnit ? (
              <div className="dashboard-page-sticky__banner">
                {renderLockedBusinessUnitInfoBox()}
              </div>
            ) : null}
            <div className="dashboard-page-sticky__tabs">
              <div className="dashboard-report-tabs" role="tablist">
                {businessUnitDashboardTabs.map((tab) => (
                  <DashboardReportTabButton
                    key={tab.id}
                    label={tab.label}
                    active={dashboardReportTab === tab.id}
                    onClick={() => setDashboardReportTab(tab.id)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="page-body page-body--report-detail">
            <div className="metric-strip dashboard-report-detail__metrics">
              {discountReport.metrics.map((metric) => (
                <MetricCard
                  key={metric.label}
                  label={metric.label}
                  count={metric.count}
                  tone={metric.tone}
                />
              ))}
            </div>
            <DashboardLineChartPanel
              title={discountReport.chart.title}
              copy={discountReport.chart.copy}
              stats={discountReport.chart.stats}
              yAxisFormatter={(value) =>
                formatSalesSummaryAxisValue("sales", value)
              }
              labels={discountReport.chart.labels}
              datasets={discountReport.chart.datasets}
            />
            <section className="table-card dashboard-report-detail__table-card">
              <TableToolbar
                searchPlaceholder="Search discount"
                searchValue={searchByPage[discountReportPageId] ?? ""}
                onSearch={(value) =>
                  handleSetSearch(discountReportPageId, value)
                }
              />
              {pagedDiscountReportRows.rows.length ? (
                <div
                  className="table-scroll"
                  data-scroll-top="false"
                  onScroll={handleTableCardScroll}
                >
                  <table className="lab-table dashboard-report-detail__table">
                    <thead>
                      <tr>
                        <th>
                          <p className="type-title-3">Discount Name</p>
                        </th>
                        <th className="is-right">
                          <p className="type-title-3">Applied (Qty)</p>
                        </th>
                        <th className="is-right">
                          <p className="type-title-3">Amount Discounted</p>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedDiscountReportRows.rows.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <p className="type-subtitle-2">
                              {row.discountName}
                            </p>
                          </td>
                          <td className="is-right">
                            <p className="type-subtitle-2">{row.appliedQty}</p>
                          </td>
                          <td className="is-right">
                            <p className="type-subtitle-2">
                              {row.amountDiscounted}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="dashboard-report-detail__empty">
                  <EmptyState
                    title="No discount rows match the current search"
                    copy="Adjust the search term to show discount usage data."
                  />
                </div>
              )}
              <TableFooterBar
                page={pagedDiscountReportRows.page}
                totalPages={pagedDiscountReportRows.totalPages}
                rowsPerPage={rowsPerPage[discountReportPageId] || 25}
                totalRows={filteredDiscountReportRows.length}
                onRowsChange={(value) =>
                  handleSetRowsPerPage(discountReportPageId, value)
                }
                onPrev={() => handlePaginate(discountReportPageId, "prev")}
                onNext={() => handlePaginate(discountReportPageId, "next")}
                onSelectPage={(value) =>
                  handleGoToPage(discountReportPageId, value)
                }
                onDownload={() =>
                  showSnackbar("Discount Report export downloaded", "green")
                }
              />
            </section>
          </div>
        </section>
      );
    }

    if (selectedSidebarBusinessUnit && businessUnitDashboardContent) {
      const activeTabContent =
        businessUnitDashboardContent[dashboardReportTab] ??
        businessUnitDashboardContent["sales-report"];

      return (
        <section className={dashboardPageClassName}>
          <div className="dashboard-page-sticky">
            <PageHeader title="Dashboard" className="page-header--dashboard" />
            {isLockedSelectedBusinessUnit ? (
              <div className="dashboard-page-sticky__banner">
                {renderLockedBusinessUnitInfoBox()}
              </div>
            ) : null}
            <div className="dashboard-page-sticky__tabs">
              <div className="dashboard-report-tabs" role="tablist">
                {businessUnitDashboardTabs.map((tab) => (
                  <DashboardReportTabButton
                    key={tab.id}
                    label={tab.label}
                    active={dashboardReportTab === tab.id}
                    onClick={() => setDashboardReportTab(tab.id)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="page-body">
            <div className="metric-strip">
              {activeTabContent.metrics.map(([label, count, tone]) => (
                <MetricCard
                  key={label}
                  label={label}
                  count={count}
                  tone={tone}
                />
              ))}
            </div>
            <section className="surface-panel">
              <div className="surface-panel__header">
                <div className="surface-panel__title-group">
                  <p className="surface-panel__title type-headline">
                    {activeTabContent.title}
                  </p>
                  <p className="surface-panel__copy type-subtitle-2 text-secondary">
                    {activeTabContent.copy}
                  </p>
                </div>
              </div>
              <div className="quick-list">
                {activeTabContent.highlights.map(([title, copy, meta]) => (
                  <div key={title} className="quick-list__item">
                    <div className="quick-list__stack">
                      <p className="quick-list__title type-title-3">{title}</p>
                      <p className="quick-list__copy type-body text-secondary">
                        {copy}
                      </p>
                    </div>
                    <span className="status-pill status-pill--muted">
                      <span className="type-body">{meta}</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
            <div className="dashboard-grid">
              <section className="surface-panel">
                <div className="surface-panel__header">
                  <div className="surface-panel__title-group">
                    <p className="surface-panel__title type-headline">
                      Operational Notes
                    </p>
                    <p className="surface-panel__copy type-subtitle-2 text-secondary">
                      High-signal report notes stay visible for the selected RMS
                      unit and active report module.
                    </p>
                  </div>
                </div>
                <div className="quick-list">
                  {activeTabContent.notes.map(([title, copy, tone]) => (
                    <div
                      key={title}
                      className={`lab-infobox lab-infobox--${tone}`}
                    >
                      <div className="lab-infobox__copy">
                        <p className="type-body-bold">{title}</p>
                        <p className="type-body">{copy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <div className="stacked-panels">
                <section className="surface-panel">
                  <div className="surface-panel__header">
                    <div className="surface-panel__title-group">
                      <p className="surface-panel__title type-headline">
                        Action Queue
                      </p>
                      <p className="surface-panel__copy type-subtitle-2 text-secondary">
                        Next steps tied to the selected report tab for{" "}
                        {selectedSidebarBusinessUnit.name}.
                      </p>
                    </div>
                  </div>
                  <div className="quick-list">
                    {activeTabContent.actions.map(([title, copy, meta]) => (
                      <div key={title} className="quick-list__item">
                        <div className="quick-list__stack">
                          <p className="quick-list__title type-title-3">
                            {title}
                          </p>
                          <p className="quick-list__copy type-body text-secondary">
                            {copy}
                          </p>
                        </div>
                        <span className="status-pill status-pill--muted">
                          <span className="type-body">{meta}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <DashboardModule pageHeader={<PageHeader title="Dashboard" className="page-header--dashboard" />}>
        <DashboardOverviewPage
          FeatureCardComponent={FeatureCard}
          dashboardOrders={records.dashboardOrders || []}
          formatIdr={formatIdr}
          onOpenCatalog={() => handleSetPage("catalog")}
          onOpenDashboard={() => handleSetPage("dashboard")}
          onOpenPricingRule={() => handleSetPage("pricing-rule")}
          onOpenUserList={() => handleSetPage("user-list")}
        />
      </DashboardModule>
    );
  }

  function renderSettingsPage() {
    return (
      <section className="page-canvas">
        <PageHeader
          title={topNavbarContext?.title}
          actionLabel={topNavbarContext?.actionLabel}
          actionIcon={topNavbarContext?.actionIcon}
          onAction={topNavbarContext?.onAction}
        />
        <div className="page-body">
          {renderLockedBusinessUnitInfoBox()}
          <div className="settings-grid">
            <div className="stacked-panels">
              <section className="surface-panel">
                <div className="surface-panel__header">
                  <div className="surface-panel__title-group">
                    <p className="surface-panel__title type-headline">
                      Business Profile
                    </p>
                    <p className="surface-panel__copy type-subtitle-2 text-secondary">
                      Text fields follow the Labamu medium shell spec: 46px
                      height, 10px radius, and 16px content padding.
                    </p>
                  </div>
                </div>
                <div className="field-grid">
                  <Field
                    label="Restaurant Name"
                    value={settingsForm.restaurantName}
                    helper="Used on receipts, kitchen dockets, and customer-facing order views."
                    required
                    onChange={(value) =>
                      handleSettingChange("restaurantName", value)
                    }
                  />
                  <Field
                    label="Operations Email"
                    value={settingsForm.email}
                    helper="Receives low-stock and sync completion alerts."
                    required
                    onChange={(value) => handleSettingChange("email", value)}
                  />
                  <Field
                    label="Default Currency"
                    value={settingsForm.currency}
                    helper="Impacts every pricing and payment display."
                    required
                    options={["IDR", "USD", "SGD"]}
                    onChange={(value) => handleSettingChange("currency", value)}
                  />
                  <Field
                    label="Branch Code"
                    value={settingsForm.branchCode}
                    helper="Reference ID used by hardware integrations."
                    required
                    onChange={(value) =>
                      handleSettingChange("branchCode", value)
                    }
                  />
                </div>
              </section>
              <section className="surface-panel">
                <div className="surface-panel__header">
                  <div className="surface-panel__title-group">
                    <p className="surface-panel__title type-headline">
                      Commercial Defaults
                    </p>
                    <p className="surface-panel__copy type-subtitle-2 text-secondary">
                      Dense desktop form layout reuses the documented split
                      field pattern.
                    </p>
                  </div>
                </div>
                <div className="field-grid">
                  <Field
                    label="Service Charge (%)"
                    value={settingsForm.serviceCharge}
                    helper="Applied to dine-in orders when enabled at outlet level."
                    required
                    onChange={(value) =>
                      handleSettingChange("serviceCharge", value)
                    }
                  />
                  <Field
                    label="Tax Rate (%)"
                    value={settingsForm.taxRate}
                    helper="Used as the default tax profile for new entities."
                    required
                    onChange={(value) => handleSettingChange("taxRate", value)}
                  />
                </div>
              </section>
            </div>
            <div className="stacked-panels">
              <section className="surface-panel">
                <div className="surface-panel__header">
                  <div className="surface-panel__title-group">
                    <p className="surface-panel__title type-headline">
                      Automation
                    </p>
                    <p className="surface-panel__copy type-subtitle-2 text-secondary">
                      Toggle components stay on the documented 51 x 32px track.
                    </p>
                  </div>
                </div>
                <div className="toggle-list">
                  <SettingsToggle
                    label="Low stock alerts"
                    copy="Send inventory notices to the operations email when a tracked SKU drops below threshold."
                    checked={settingsForm.lowStockAlerts}
                    onChange={() => handleSettingToggle("lowStockAlerts")}
                  />
                  <SettingsToggle
                    label="Auto-accept online orders"
                    copy="Immediately push delivery orders to the kitchen queue without manual confirmation."
                    checked={settingsForm.autoAcceptOrders}
                    onChange={() => handleSettingToggle("autoAcceptOrders")}
                  />
                  <SettingsToggle
                    label="Customer receipts"
                    copy="Send digital receipt links after a successful settlement."
                    checked={settingsForm.customerReceipts}
                    onChange={() => handleSettingToggle("customerReceipts")}
                  />
                </div>
              </section>
              <section className="surface-panel">
                <div className="surface-panel__header">
                  <div className="surface-panel__title-group">
                    <p className="surface-panel__title type-headline">
                      Environment Notes
                    </p>
                  </div>
                </div>
                <div className="quick-list">
                  <div className="quick-list__item">
                    <div className="quick-list__stack">
                      <p className="quick-list__title type-title-3">
                        POS Endpoint
                      </p>
                      <p className="quick-list__copy type-body text-secondary">
                        Main account is connected to four outlets and one
                        staging cashier environment.
                      </p>
                    </div>
                    <span className="status-pill status-pill--success">
                      <span className="type-body">Live</span>
                    </span>
                  </div>
                  <div className="quick-list__item">
                    <div className="quick-list__stack">
                      <p className="quick-list__title type-title-3">
                        Catalog Sync
                      </p>
                      <p className="quick-list__copy type-body text-secondary">
                        Last sync completed 8 minutes ago without warnings.
                      </p>
                    </div>
                    <span className="status-pill status-pill--success">
                      <span className="type-body">Healthy</span>
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderDashboardReportDetailPage() {
    if (!selectedDashboardReportDetail) {
      return renderDashboardPage();
    }

    const isInventoryReport =
      selectedDashboardReportDetail.id === "inventory-report";
    const inventoryReportDetail = isInventoryReport
      ? createInventoryReportDetail(dashboardReportScopeLabel)
      : null;
    const inventoryTabs = inventoryReportDetail?.tabs ?? [];
    const activeInventoryTab = inventoryTabs.find(
      (tab) => tab.id === dashboardReportDetailView
    )
      ? inventoryTabs.find((tab) => tab.id === dashboardReportDetailView)
      : inventoryTabs[0] ?? null;
    const scopedInventoryDetailColumns = getDashboardScopedColumns(
      activeInventoryTab?.columns ?? [],
      Boolean(selectedSidebarBusinessUnit)
    );

    if (isInventoryReport && inventoryReportDetail && activeInventoryTab) {
      const normalizedSearch =
        (searchByPage["dashboard-report-detail"] ?? "").trim().toLowerCase();
      const inventoryIngredientOptions = createUniqueCountedFilterOptions(
        activeInventoryTab.rows || [],
        (row) => row.ingredient
      );
      const inventoryCategoryOptions = createUniqueCountedFilterOptions(
        activeInventoryTab.rows || [],
        (row) => row.category
      );
      const inventoryStatusOptions =
        activeInventoryTab.id === "stock-level"
          ? createCountedFilterOptions(
            ["Available", "Low", "Empty"],
            activeInventoryTab.rows || [],
            (row) => row.status
          )
          : [];
      const inventoryMovementTypeOptions =
        activeInventoryTab.id === "stock-movement"
          ? createUniqueCountedFilterOptions(
            activeInventoryTab.rows || [],
            (row) => row.movementType
          )
          : [];
      const inventoryUpdatedByOptions =
        activeInventoryTab.id === "stock-movement"
          ? createUniqueCountedFilterOptions(
            activeInventoryTab.rows || [],
            (row) => row.updatedBy
          )
          : [];
      const inventoryFilteredRows = (activeInventoryTab.rows || []).filter((row) => {
        const matchesCategory =
          !dashboardReportFilters.category.length ||
          dashboardReportFilters.category.includes(row.category);
        const matchesIngredient =
          !dashboardReportFilters.ingredient.length ||
          dashboardReportFilters.ingredient.includes(row.ingredient);
        const matchesStatus =
          activeInventoryTab.id !== "stock-level" ||
          !dashboardReportFilters.status.length ||
          dashboardReportFilters.status.includes(row.status);
        const matchesMovementType =
          activeInventoryTab.id !== "stock-movement" ||
          !dashboardReportFilters.movementType.length ||
          dashboardReportFilters.movementType.includes(row.movementType);
        const matchesUpdatedBy =
          activeInventoryTab.id !== "stock-movement" ||
          !dashboardReportFilters.updatedBy.length ||
          dashboardReportFilters.updatedBy.includes(row.updatedBy);
        const matchesSearch =
          !normalizedSearch ||
          activeInventoryTab.searchFields.some((field) =>
            String(row[field] ?? "")
              .toLowerCase()
              .includes(normalizedSearch)
          );

        return (
          matchesCategory &&
          matchesIngredient &&
          matchesStatus &&
          matchesMovementType &&
          matchesUpdatedBy &&
          matchesSearch
        );
      });
      const activeInventorySortKey = inventoryReportSort.key;
      const sortedInventoryRows = activeInventoryTab.columns.some(
        (column) =>
          column.sortable &&
          (column.sortKey ?? column.key) === activeInventorySortKey
      )
        ? inventoryFilteredRows.slice().sort((left, right) => {
          const leftValue = left[activeInventorySortKey];
          const rightValue = right[activeInventorySortKey];

          if (typeof leftValue === "number" && typeof rightValue === "number") {
            return inventoryReportSort.direction === "asc"
              ? leftValue - rightValue
              : rightValue - leftValue;
          }

          return inventoryReportSort.direction === "asc"
            ? String(leftValue ?? "").localeCompare(String(rightValue ?? ""))
            : String(rightValue ?? "").localeCompare(String(leftValue ?? ""));
        })
        : inventoryFilteredRows;
      const paged = getPagedRows("dashboard-report-detail", sortedInventoryRows);

      return (
        <section className="page-canvas page-canvas--detail">
          <PageHeader
            title={topNavbarContext?.title}
            breadcrumb={topNavbarContext?.breadcrumb}
            onBack={topNavbarContext?.onBack}
            backAriaLabel={topNavbarContext?.backAriaLabel}
          />
          <div className="page-body page-body--report-detail dashboard-report-detail__page-body dashboard-report-detail__page-body--inventory">
            {renderLockedBusinessUnitInfoBox()}
            <div className="dashboard-report-detail__overview dashboard-report-detail__overview--inventory">
              <div className="dashboard-report-detail__metric-grid dashboard-report-detail__metric-grid--inventory">
                {(inventoryReportDetail.metrics || []).map((metric) => (
                  <DashboardStackedMetricCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.count}
                    tone={metric.tone}
                    iconName={metric.iconName}
                  />
                ))}
              </div>
              <DashboardInventoryProgressCard
                title={inventoryReportDetail.progress?.title ?? "Inventory"}
                copy={inventoryReportDetail.progress?.copy ?? ""}
                ingredients={inventoryReportDetail.progress?.ingredients ?? []}
              />
            </div>
            <section className="table-card dashboard-report-detail__table-card dashboard-report-module__table-panel dashboard-report-module__table-panel--flush">
              <div className="dashboard-report-module__table-top-controls">
                <div
                  className="dashboard-report-module__table-top-tabs"
                  role="tablist"
                >
                  {inventoryTabs.map((tab) => (
                    <DashboardDetailTabButton
                      key={tab.id}
                      label={tab.label}
                      active={activeInventoryTab.id === tab.id}
                      onClick={() =>
                        handleSetDashboardReportDetailView(tab.id)
                      }
                    />
                  ))}
                </div>
              </div>
              <TableToolbar
                filters={
                  <div className="dashboard-report-detail__toolbar-start">
                    <FilterChip
                      label="Category"
                      values={dashboardReportFilters.category}
                      options={inventoryCategoryOptions}
                      onChange={(value) =>
                        handleSetDashboardReportFilter("category", value)
                      }
                    />
                    <FilterChip
                      label="Ingredients"
                      values={dashboardReportFilters.ingredient}
                      options={inventoryIngredientOptions}
                      onChange={(value) =>
                        handleSetDashboardReportFilter("ingredient", value)
                      }
                    />
                    {activeInventoryTab.id === "stock-level" ? (
                      <FilterChip
                        label="Status"
                        values={dashboardReportFilters.status}
                        options={inventoryStatusOptions}
                        onChange={(value) =>
                          handleSetDashboardReportFilter("status", value)
                        }
                      />
                    ) : null}
                    {activeInventoryTab.id === "stock-movement" ? (
                      <FilterChip
                        label="Type"
                        values={dashboardReportFilters.movementType}
                        options={inventoryMovementTypeOptions}
                        onChange={(value) =>
                          handleSetDashboardReportFilter("movementType", value)
                        }
                      />
                    ) : null}
                    {activeInventoryTab.id === "stock-movement" ? (
                      <FilterChip
                        label="Updated By"
                        values={dashboardReportFilters.updatedBy}
                        options={inventoryUpdatedByOptions}
                        onChange={(value) =>
                          handleSetDashboardReportFilter("updatedBy", value)
                        }
                      />
                    ) : null}
                  </div>
                }
                searchPlaceholder={activeInventoryTab.searchPlaceholder}
                searchValue={searchByPage["dashboard-report-detail"] ?? ""}
                onSearch={(value) =>
                  handleSetSearch("dashboard-report-detail", value)
                }
              />
              {sortedInventoryRows.length ? (
                <div
                  className="table-scroll dashboard-report-module__table-scroll"
                  data-max-height="400"
                  data-scroll-top="false"
                  onScroll={handleTableCardScroll}
                >
                  <table className="lab-table">
                    <thead>
                      <tr>
                        {scopedInventoryDetailColumns.map((column) => (
                          <th
                            key={column.key}
                            className={
                              column.align === "right" ? "is-right" : undefined
                            }
                          >
                            {column.sortable ? (
                              <button
                                type="button"
                                className={`dashboard-table-sort type-title-3${(column.sortKey ?? column.key) ===
                                  inventoryReportSort.key
                                  ? " is-active"
                                  : ""
                                  }`}
                                onClick={() =>
                                  handleSetInventoryReportSort(
                                    column.sortKey ?? column.key
                                  )
                                }
                              >
                                <span>{column.label}</span>
                                <span
                                  className="dashboard-table-sort__icon"
                                  aria-hidden="true"
                                >
                                  <ChevronIcon
                                    name="filterChevron"
                                    size={16}
                                    color="#C2C2C2"
                                    direction={
                                      (column.sortKey ?? column.key) ===
                                        inventoryReportSort.key &&
                                        inventoryReportSort.direction === "desc"
                                        ? "up"
                                        : "down"
                                    }
                                  />
                                </span>
                              </button>
                            ) : (
                              <p className="type-title-3">{column.label}</p>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paged.rows.map((row) => (
                        <tr key={row.id}>
                          {scopedInventoryDetailColumns.map((column) => (
                            <td
                              key={`${row.id}-${column.key}`}
                              className={
                                column.align === "right"
                                  ? "is-right"
                                  : undefined
                              }
                            >
                              {column.type === "status" ? (
                                <StatusPill status={row[column.key] ?? "-"} />
                              ) : column.render ? (
                                column.render(row)
                              ) : (
                                <p
                                  className={`type-subtitle-2${column.contentClassName
                                    ? ` ${column.contentClassName}`
                                    : ""
                                    }`}
                                >
                                  {row[column.key] ?? "-"}
                                </p>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="dashboard-report-detail__empty">
                  <EmptyState
                    title="No inventory rows match the current filters"
                    copy="Adjust the selected period or search term to show inventory data."
                  />
                </div>
              )}
              <TableFooterBar
                page={paged.page}
                totalPages={paged.totalPages}
                rowsPerPage={rowsPerPage["dashboard-report-detail"] || 25}
                totalRows={sortedInventoryRows.length}
                onRowsChange={(value) =>
                  handleSetRowsPerPage("dashboard-report-detail", value)
                }
                onPrev={() => handlePaginate("dashboard-report-detail", "prev")}
                onNext={() => handlePaginate("dashboard-report-detail", "next")}
                onSelectPage={(value) =>
                  handleGoToPage("dashboard-report-detail", value)
                }
                onDownload={() =>
                  showSnackbar("Inventory Report export downloaded", "green")
                }
              />
            </section>
          </div>
        </section>
      );
    }

    const isDiscountReport =
      selectedDashboardReportDetail.id === "discount-summary";
    const discountReportDetail = isDiscountReport
      ? createDiscountReportDetail(
        dashboardReportScopeLabel,
        discountReportRange
      )
      : null;

    if (isDiscountReport && discountReportDetail) {
      const filteredDiscountRows = (discountReportDetail.rows || []).filter((row) =>
        !dashboardReportSearch
          ? true
          : row.discountName.toLowerCase().includes(dashboardReportSearch)
      );
      const sortedDiscountRows = filteredDiscountRows.slice().sort((left, right) => {
        const leftValue = left[salesReportSort.key];
        const rightValue = right[salesReportSort.key];

        if (typeof leftValue === "number" && typeof rightValue === "number") {
          return salesReportSort.direction === "asc"
            ? leftValue - rightValue
            : rightValue - leftValue;
        }

        return salesReportSort.direction === "asc"
          ? String(leftValue ?? "").localeCompare(String(rightValue ?? ""))
          : String(rightValue ?? "").localeCompare(String(leftValue ?? ""));
      });
      const paged = getPagedRows("dashboard-report-detail", sortedDiscountRows);

      return (
        <section className="page-canvas page-canvas--detail">
          <PageHeader
            title={topNavbarContext?.title}
            breadcrumb={topNavbarContext?.breadcrumb}
            onBack={topNavbarContext?.onBack}
            backAriaLabel={topNavbarContext?.backAriaLabel}
          />
          <div className="page-body page-body--report-detail">
            {renderLockedBusinessUnitInfoBox()}
            <div className="dashboard-discount-report">
              <section className="dashboard-discount-report__overview">
                <div className="dashboard-discount-report__metrics">
                  {discountReportDetail.metrics.map((metric) => (
                    <DashboardStackedMetricCard
                      key={metric.label}
                      label={metric.label}
                      value={metric.value}
                      tone={metric.tone}
                    />
                  ))}
                </div>
                <DashboardLineChartPanel
                  title={discountReportDetail.chart.title}
                  copy={discountReportDetail.chart.copy}
                  stats={[]}
                  yAxisFormatter={(value) =>
                    formatSalesSummaryAxisValue("sales", value)
                  }
                  tabs={SALES_SUMMARY_RANGE_TABS}
                  activeTab={discountReportRange}
                  onTabSelect={setDiscountReportRange}
                  chartHeight={124}
                  minCanvasWidth={0}
                  labels={discountReportDetail.chart.labels}
                  datasets={discountReportDetail.chart.datasets}
                />
              </section>
              <section className="table-card dashboard-report-detail__table-card">
                <TableToolbar
                  filters={null}
                  searchPlaceholder="Search discount"
                  searchValue={searchByPage["dashboard-report-detail"] ?? ""}
                  onSearch={(value) =>
                    handleSetSearch("dashboard-report-detail", value)
                  }
                />
                <div
                  className="table-scroll"
                  data-scroll-top="false"
                  onScroll={handleTableCardScroll}
                >
                  <table className="lab-table dashboard-report-detail__table">
                    <thead>
                      <tr>
                        {discountReportDetail.columns.map((column) => (
                          <th
                            key={column.key}
                            className={
                              column.align === "right" ? "is-right" : ""
                            }
                          >
                            <p className="type-title-3">{column.label}</p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paged.rows.map((row) => (
                        <tr key={row.id}>
                          {discountReportDetail.columns.map((column) => (
                            <td
                              key={`${row.id}-${column.key}`}
                              className={
                                column.align === "right" ? "is-right" : ""
                              }
                            >
                              <p className="type-subtitle-2">
                                {row[column.key]}
                              </p>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TableFooterBar
                  page={paged.page}
                  totalPages={paged.totalPages}
                  rowsPerPage={rowsPerPage["dashboard-report-detail"] || 25}
                  totalRows={filteredDiscountRows.length}
                  onRowsChange={(value) =>
                    handleSetRowsPerPage("dashboard-report-detail", value)
                  }
                  onPrev={() => handlePaginate("dashboard-report-detail", "prev")}
                  onNext={() => handlePaginate("dashboard-report-detail", "next")}
                  onSelectPage={(value) =>
                    handleGoToPage("dashboard-report-detail", value)
                  }
                  onDownload={() =>
                    showSnackbar("Discount Report export downloaded", "green")
                  }
                />
              </section>
            </div>
          </div>
        </section>
      );
    }

    const isAdvancedReport =
      selectedDashboardReportDetail.id === "sales-orders";
    const isDiscountUsageView =
      isAdvancedReport && dashboardReportDetailView === "discount-usage";
    const activeOrderColumns =
      isAdvancedReport && selectedDashboardReportDetail
        ? selectedDashboardReportDetail.orderColumns.filter(
          (column) =>
            !selectedSidebarBusinessUnit || column.key !== "businessUnit"
        )
        : [];
    const activeAggregateMeta = getDashboardReportAggregateMeta(
      dashboardReportDetailView
    );
    const showEntityAggregateColumn =
      ["by-item", "by-category", "by-modifier", "by-table"].includes(
        dashboardReportDetailView
      ) && !selectedSidebarBusinessUnit;
    const activeAggregateColumns =
      dashboardReportDetailView === "by-order"
        ? []
        : [
          { key: "groupLabel", label: activeAggregateMeta.label },
          ...(showEntityAggregateColumn
            ? [{ key: "businessUnit", label: "Entity", sortable: true }]
            : []),
          ...(dashboardReportDetailView === "by-table"
            ? [
              { key: "floor", label: "Floor", sortable: true },
              { key: "section", label: "Section", sortable: true },
            ]
            : []),
          { key: "totalOrders", label: "Total Orders", align: "right", sortable: true, sortKey: "totalOrdersValue" },
          { key: "discountApplied", label: "Discount", align: "right", sortable: true, sortKey: "discountAppliedValue" },
          { key: "taxCollected", label: "Tax", align: "right", sortable: true, sortKey: "taxCollectedValue" },
          {
            key: "totalGrossSales",
            label: "Total Gross Sales",
            align: "right",
            sortable: true,
            sortKey: "totalGrossSalesValue",
          },
          {
            key: "totalNetSales",
            label: "Total Net Sales",
            align: "right",
            sortable: true,
            sortKey: "totalNetSalesValue",
          },
        ];
    const activeAdvancedColumns = isAdvancedReport
      ? isDiscountUsageView
        ? dashboardDiscountUsageDetail?.columns ?? []
        : dashboardReportDetailView === "by-order"
          ? activeOrderColumns
          : activeAggregateColumns
      : [];
    const activeAdvancedRows = isAdvancedReport
      ? isDiscountUsageView
        ? filteredDashboardDiscountUsageRows
        : dashboardReportDetailView === "by-order"
          ? filteredDashboardReportRows
          : dashboardReportAggregatedRows
      : [];
    const dashboardReportTrendPanel = isAdvancedReport
      ? isDiscountUsageView
        ? dashboardDiscountUsageDetail?.chart ?? null
        : createDashboardReportTrendPanel(
          dashboardReportTrendRows,
          dashboardReportDetailView,
          dashboardReportTrendRange,
          dashboardReportTrendAnchorDate,
          dashboardReportTrendWindow
        )
      : null;
    const sortedAdvancedRows = (
      isAdvancedReport ? activeAdvancedRows : (selectedDashboardReportDetail.rows || [])
    ).slice().sort((left, right) => {
      const leftValue = left[salesReportSort.key];
      const rightValue = right[salesReportSort.key];

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return salesReportSort.direction === "asc"
          ? leftValue - rightValue
          : rightValue - leftValue;
      }

      return salesReportSort.direction === "asc"
        ? String(leftValue ?? "").localeCompare(String(rightValue ?? ""))
        : String(rightValue ?? "").localeCompare(String(leftValue ?? ""));
    });

    const paged = getPagedRows(
      "dashboard-report-detail",
      sortedAdvancedRows
    );

    if (isAdvancedReport) {
      const filters = (
        <div className="dashboard-report-detail__toolbar-start">
          <FilterChip
            label="Shift"
            values={dashboardReportFilters.shift}
            options={dashboardReportFilterOptions.shift ?? []}
            onChange={(value) => handleSetDashboardReportFilter("shift", value)}
          />
          <FilterChip
            label="Staff"
            values={dashboardReportFilters.staff}
            options={dashboardReportFilterOptions.staff ?? []}
            onChange={(value) => handleSetDashboardReportFilter("staff", value)}
          />
          <FilterChip
            label="Order Type"
            values={dashboardReportFilters.orderType}
            options={dashboardReportFilterOptions.orderType ?? []}
            onChange={(value) =>
              handleSetDashboardReportFilter("orderType", value)
            }
          />
          <FilterChip
            label="Discount"
            values={dashboardReportFilters.discount}
            options={dashboardReportFilterOptions.discount ?? []}
            onChange={(value) =>
              handleSetDashboardReportFilter("discount", value)
            }
          />
          {dashboardReportDetailView === "by-order" ? (
            <FilterChip
              label="Payment"
              values={dashboardReportFilters.payment}
              options={dashboardReportFilterOptions.payment ?? []}
              onChange={(value) =>
                handleSetDashboardReportFilter("payment", value)
              }
            />
          ) : null}
          {dashboardReportDetailView === "by-order" ? (
            <FilterChip
              label="Status"
              values={dashboardReportFilters.status}
              options={dashboardReportFilterOptions.status ?? []}
              onChange={(value) =>
                handleSetDashboardReportFilter("status", value)
              }
            />
          ) : null}
        </div>
      );

      return (
        <section className="page-canvas page-canvas--detail">
          <div className="dashboard-page-sticky">
            <PageHeader
              title={topNavbarContext?.title}
              breadcrumb={topNavbarContext?.breadcrumb}
              onBack={topNavbarContext?.onBack}
              backAriaLabel={topNavbarContext?.backAriaLabel}
            />
            {renderLockedBusinessUnitInfoBox() ? (
              <div className="dashboard-page-sticky__banner">
                {renderLockedBusinessUnitInfoBox()}
              </div>
            ) : null}
            <div className="dashboard-page-sticky__tabs">
              <div className="dashboard-report-detail__top-controls">
                <div className="dashboard-report-tabs" role="tablist">
                  {!selectedSidebarBusinessUnit ? (
                    <DashboardReportTabButton
                      label="By Entity"
                      active={dashboardReportDetailView === "by-business-unit"}
                      onClick={() =>
                        handleSetDashboardReportDetailView("by-business-unit")
                      }
                    />
                  ) : null}
                  <DashboardReportTabButton
                    label="By Transaction"
                    active={dashboardReportDetailView === "by-order"}
                    onClick={() =>
                      handleSetDashboardReportDetailView("by-order")
                    }
                  />
                  <DashboardReportTabButton
                    label="By Item"
                    active={dashboardReportDetailView === "by-item"}
                    onClick={() => handleSetDashboardReportDetailView("by-item")}
                  />
                  <DashboardReportTabButton
                    label="By Category"
                    active={dashboardReportDetailView === "by-category"}
                    onClick={() =>
                      handleSetDashboardReportDetailView("by-category")
                    }
                  />
                  <DashboardReportTabButton
                    label="By Order Type"
                    active={dashboardReportDetailView === "by-order-type"}
                    onClick={() =>
                      handleSetDashboardReportDetailView("by-order-type")
                    }
                  />
                  <DashboardReportTabButton
                    label="By Modifier"
                    active={dashboardReportDetailView === "by-modifier"}
                    onClick={() =>
                      handleSetDashboardReportDetailView("by-modifier")
                    }
                  />
                  <DashboardReportTabButton
                    label="By Table"
                    active={dashboardReportDetailView === "by-table"}
                    onClick={() =>
                      handleSetDashboardReportDetailView("by-table")
                    }
                  />
                  <DashboardReportTabButton
                    label="By Staff"
                    active={dashboardReportDetailView === "by-staff"}
                    onClick={() =>
                      handleSetDashboardReportDetailView("by-staff")
                    }
                  />
                  <DashboardReportTabButton
                    label="By Payment Method"
                    active={dashboardReportDetailView === "by-payment-method"}
                    onClick={() =>
                      handleSetDashboardReportDetailView("by-payment-method")
                    }
                  />
                  <DashboardReportTabButton
                    label="Discount Usage"
                    active={dashboardReportDetailView === "discount-usage"}
                    onClick={() =>
                      handleSetDashboardReportDetailView("discount-usage")
                    }
                  />
                </div>
                <div className="dashboard-report-detail__controls">
                  {!selectedSidebarBusinessUnit ? (
                    <SingleSelectFilterChip
                      label="Entity"
                      value={dashboardBusinessUnitFilter}
                      options={dashboardBusinessUnitOptions}
                      onChange={handleSetDashboardBusinessUnitFilter}
                    />
                  ) : null}
                  <SingleSelectFilterChip
                    label="Time Period"
                    value={dashboardReportTimeRange}
                    options={DASHBOARD_REPORT_TIME_RANGE_OPTIONS}
                    onChange={handleSetDashboardReportTimeRange}
                    align="end"
                    customDateRange={dashboardReportCustomRange}
                    onCustomDateChange={handleSetDashboardReportCustomDate}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="page-body page-body--report-detail dashboard-report-detail__page-body">
            {isDiscountUsageView ? (
              <div className="dashboard-report-detail__overview">
                <div className="dashboard-report-detail__metric-grid dashboard-report-detail__metric-grid--sales-orders dashboard-report-detail__metric-grid--discount-usage">
                  {dashboardDiscountUsageDetail?.metrics.map((metric) => (
                    <DashboardStackedMetricCard
                      key={metric.label}
                      label={metric.label}
                      value={metric.value}
                      tone={metric.tone}
                      iconName={metric.iconName}
                    />
                  ))}
                </div>
                {dashboardReportTrendPanel ? (
                  <DashboardLineChartPanel
                    title={dashboardReportTrendPanel.title}
                    copy={dashboardReportTrendPanel.copy}
                    stats={[]}
                    yAxisFormatter={(value) =>
                      formatSalesSummaryAxisValue("sales", value)
                    }
                    tabs={dashboardReportTrendTabs}
                    activeTab={dashboardReportTrendRange}
                    onTabSelect={setDashboardReportTrendRange}
                    navigationLabel={getDashboardReportTrendNavigationLabel(
                      dashboardReportTrendRange,
                      dashboardReportTimeRange,
                      dashboardReportCustomRange,
                      scopedDashboardReportRows,
                      createDashboardReportAnchorDate(),
                      activeDashboardReportTrendOffset
                    )}
                    onNavigatePrev={() =>
                      handleNavigateDashboardReportTime("prev")
                    }
                    onNavigateNext={() =>
                      handleNavigateDashboardReportTime("next")
                    }
                    canNavigatePrev={
                      activeDashboardReportTrendOffset <
                      dashboardReportTrendNavigationLimit
                    }
                    canNavigateNext={
                      activeDashboardReportTrendOffset > 0
                    }
                    labels={dashboardReportTrendPanel.labels}
                    datasets={dashboardReportTrendPanel.datasets}
                    chartHeight={176}
                    minCanvasWidth={0}
                  />
                ) : null}
              </div>
            ) : (
              <div className="dashboard-report-detail__overview">
                <div className="dashboard-report-detail__metric-grid dashboard-report-detail__metric-grid--sales-orders">
                  {dashboardReportMetricCards.map((metric) => (
                    <DashboardStackedMetricCard
                      key={metric.label}
                      label={metric.label}
                      value={metric.count}
                      tone={metric.tone}
                      iconName={metric.iconName}
                    />
                  ))}
                </div>
                {dashboardReportTrendPanel ? (
                  <DashboardLineChartPanel
                    title={dashboardReportTrendPanel.title}
                    copy={dashboardReportTrendPanel.copy}
                    stats={[]}
                    yAxisFormatter={(value) =>
                      formatSalesSummaryAxisValue("sales", value)
                    }
                    tabs={dashboardReportTrendTabs}
                    activeTab={dashboardReportTrendRange}
                    onTabSelect={setDashboardReportTrendRange}
                    navigationLabel={getDashboardReportTrendNavigationLabel(
                      dashboardReportTrendRange,
                      dashboardReportTimeRange,
                      dashboardReportCustomRange,
                      scopedDashboardReportRows,
                      createDashboardReportAnchorDate(),
                      activeDashboardReportTrendOffset
                    )}
                    onNavigatePrev={() => handleNavigateDashboardReportTime("prev")}
                    onNavigateNext={() => handleNavigateDashboardReportTime("next")}
                    canNavigatePrev={
                      activeDashboardReportTrendOffset <
                      dashboardReportTrendNavigationLimit
                    }
                    canNavigateNext={
                      activeDashboardReportTrendOffset > 0
                    }
                    labels={dashboardReportTrendPanel.labels}
                    datasets={dashboardReportTrendPanel.datasets}
                    chartHeight={176}
                    minCanvasWidth={0}
                  />
                ) : null}
              </div>
            )}
            <section className="table-card dashboard-report-detail__table-card">
              <TableToolbar
                filters={
                  isDiscountUsageView ? (
                    <div className="dashboard-report-detail__toolbar-start">
                      <FilterChip
                        label="Shift"
                        values={dashboardReportFilters.shift}
                        options={dashboardDiscountUsageFilterOptions.shift ?? []}
                        onChange={(value) =>
                          handleSetDashboardReportFilter("shift", value)
                        }
                      />
                      <FilterChip
                        label="Staff"
                        values={dashboardReportFilters.staff}
                        options={dashboardDiscountUsageFilterOptions.staff ?? []}
                        onChange={(value) =>
                          handleSetDashboardReportFilter("staff", value)
                        }
                      />
                      <FilterChip
                        label="Order Type"
                        values={dashboardReportFilters.orderType}
                        options={
                          dashboardDiscountUsageFilterOptions.orderType ?? []
                        }
                        onChange={(value) =>
                          handleSetDashboardReportFilter("orderType", value)
                        }
                      />
                      <FilterChip
                        label="Payment"
                        values={dashboardReportFilters.payment}
                        options={dashboardDiscountUsageFilterOptions.payment ?? []}
                        onChange={(value) =>
                          handleSetDashboardReportFilter("payment", value)
                        }
                      />
                    </div>
                  ) : (
                    filters
                  )
                }
                searchPlaceholder={
                  isDiscountUsageView
                    ? "Search discount"
                    : dashboardReportDetailView === "by-order"
                      ? "Search transaction"
                      : dashboardReportDetailView === "by-category"
                        ? "Search category"
                        : dashboardReportDetailView === "by-business-unit"
                          ? "Search entity"
                          : dashboardReportDetailView === "by-modifier"
                            ? "Search modifier"
                            : dashboardReportDetailView === "by-order-type"
                              ? "Search order type"
                              : dashboardReportDetailView === "by-table"
                                ? "Search table"
                                : dashboardReportDetailView === "by-staff"
                                  ? "Search staff"
                                  : dashboardReportDetailView === "by-payment-method"
                                    ? "Search payment method"
                                    : "Search catalog"
                }
                searchValue={searchByPage["dashboard-report-detail"] ?? ""}
                onSearch={(value) =>
                  handleSetSearch("dashboard-report-detail", value)
                }
              />
              {paged.rows.length ? (
                <div
                  className="table-scroll"
                  data-max-height="400"
                  data-scroll-top="false"
                  onScroll={handleTableCardScroll}
                >
                  <table className="lab-table dashboard-report-detail__table">
                    <thead>
                      <tr>
                        {activeAdvancedColumns.map((column) => (
                          <th
                            key={column.key}
                            className={
                              column.align === "right" ? "is-right" : undefined
                            }
                          >
                            {column.sortable ? (
                              <button
                                type="button"
                                className={`dashboard-table-sort type-title-3${(column.sortKey ?? column.key) ===
                                  salesReportSort.key
                                  ? " is-active"
                                  : ""
                                  }`}
                                onClick={() =>
                                  handleSetSalesReportSort(
                                    column.sortKey ?? column.key
                                  )
                                }
                              >
                                <span>{column.label}</span>
                                <span
                                  className="dashboard-table-sort__icon"
                                  aria-hidden="true"
                                >
                                  <ChevronIcon
                                    name="filterChevron"
                                    size={16}
                                    color="#C2C2C2"
                                    direction={
                                      (column.sortKey ?? column.key) ===
                                        salesReportSort.key &&
                                        salesReportSort.direction === "desc"
                                        ? "up"
                                        : "down"
                                    }
                                  />
                                </span>
                              </button>
                            ) : (
                              <p className="type-title-3">{column.label}</p>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paged.rows.map((row) => (
                        <tr key={row.id}>
                          {activeAdvancedColumns.map((column) => {
                            if (column.type === "status") {
                              return (
                                <td
                                  key={`${row.id}-${column.key}`}
                                  className={
                                    column.align === "right"
                                      ? "is-right"
                                      : undefined
                                  }
                                >
                                  <StatusPill status={row[column.key] ?? "-"} />
                                </td>
                              );
                            }

                            if (column.subtitleKey && row[column.subtitleKey]) {
                              const cellValueToRender =
                                column.key === "deviceConnected"
                                  ? getDeviceConnectedDisplayValue(row)
                                  : row[column.key] ?? "-";

                              return (
                                <td
                                  key={`${row.id}-${column.key}`}
                                  className={
                                    column.align === "right"
                                      ? "is-right"
                                      : undefined
                                  }
                                >
                                  <div className="dashboard-report-detail__cell-stack">
                                    <p className="type-subtitle-2">
                                      {cellValueToRender}
                                    </p>
                                    <p className="type-body text-secondary">
                                      {row[column.subtitleKey]}
                                    </p>
                                  </div>
                                </td>
                              );
                            }

                            return (
                              <td
                                key={`${row.id}-${column.key}`}
                                className={
                                  column.align === "right"
                                    ? "is-right"
                                    : undefined
                                }
                              >
                                <p
                                  className={`type-subtitle-2${column.contentClassName
                                    ? ` ${column.contentClassName}`
                                    : ""
                                    }`}
                                >
                                  {row[column.key] ?? "-"}
                                </p>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="dashboard-report-detail__empty">
                  <EmptyState
                    title="No report rows match the current filters"
                    copy="Adjust the selected period, filter chips, or search term to show report data."
                  />
                </div>
              )}
              <TableFooterBar
                page={paged.page}
                totalPages={paged.totalPages}
                rowsPerPage={rowsPerPage["dashboard-report-detail"] || 25}
                totalRows={activeAdvancedRows.length}
                onRowsChange={(value) =>
                  handleSetRowsPerPage("dashboard-report-detail", value)
                }
                onPrev={() => handlePaginate("dashboard-report-detail", "prev")}
                onNext={() => handlePaginate("dashboard-report-detail", "next")}
                onSelectPage={(value) =>
                  handleGoToPage("dashboard-report-detail", value)
                }
                onDownload={() =>
                  showSnackbar(
                    isDiscountUsageView
                      ? "Discount Usage export downloaded"
                      : "Sales & Orders Report export downloaded",
                    "green"
                  )
                }
              />
            </section>
          </div>
        </section>
      );
    }

    return (
      <section className="page-canvas page-canvas--detail">
        <div className="page-body page-body--report-detail">
          {renderLockedBusinessUnitInfoBox()}
          <div className="dashboard-report-detail">
            <div className="metric-strip">
              {(selectedDashboardReportDetail.summary || []).map(([label, count]) => (
                <MetricCard
                  key={label}
                  label={label}
                  count={count}
                  tone="neutral"
                />
              ))}
            </div>
            <section className="surface-panel">
              <div className="surface-panel__header">
                <div className="surface-panel__title-group">
                  <p className="surface-panel__title type-headline">
                    {selectedDashboardReportDetail.title}
                  </p>
                  <p className="surface-panel__copy type-subtitle-2 text-secondary">
                    {selectedDashboardReportDetail.copy}
                  </p>
                </div>
              </div>
              <div className="table-scroll">
                <table className="lab-table dashboard-report-detail__table">
                  <thead>
                    <tr>
                      {(selectedDashboardReportDetail.columns || []).map((column) => (
                        <th
                          key={column.key}
                          className={column.align === "right" ? "is-right" : ""}
                        >
                          <p className="type-title-3">{column.label}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.rows.map((row) => (
                      <tr key={row.id}>
                        {(selectedDashboardReportDetail.columns || []).map((column) => (
                          <td
                            key={`${row.id}-${column.key}`}
                            className={
                              column.align === "right" ? "is-right" : ""
                            }
                          >
                            <p className="type-subtitle-2">{row[column.key]}</p>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TableFooterBar
                page={paged.page}
                totalPages={paged.totalPages}
                rowsPerPage={rowsPerPage["dashboard-report-detail"] || 25}
                totalRows={(selectedDashboardReportDetail.rows || []).length}
                onRowsChange={(value) =>
                  handleSetRowsPerPage("dashboard-report-detail", value)
                }
                onPrev={() => handlePaginate("dashboard-report-detail", "prev")}
                onNext={() => handlePaginate("dashboard-report-detail", "next")}
                onSelectPage={(value) =>
                  handleGoToPage("dashboard-report-detail", value)
                }
                onDownload={() =>
                  showSnackbar(
                    `${selectedDashboardReportDetail.title} export downloaded`,
                    "green"
                  )
                }
              />
            </section>
          </div>
        </div>
      </section>
    );
  }

  function renderDashboardDiscountReportDetailPage() {
    if (!selectedSidebarBusinessUnit) {
      return renderDashboardPage();
    }

    const discountReportDetail = createDiscountReportDetail(
      selectedSidebarBusinessUnit.name,
      discountReportRange
    );
    const searchValue = searchByPage["dashboard-report-detail"] ?? "";
    const normalizedSearch = searchValue.trim().toLowerCase();
    const filteredRows = discountReportDetail.rows.filter((row) =>
      !normalizedSearch
        ? true
        : row.discountName.toLowerCase().includes(normalizedSearch)
    );
    const sortedRows = filteredRows.slice().sort((left, right) => {
      const leftValue = left[salesReportSort.key];
      const rightValue = right[salesReportSort.key];

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return salesReportSort.direction === "asc"
          ? leftValue - rightValue
          : rightValue - leftValue;
      }

      return salesReportSort.direction === "asc"
        ? String(leftValue ?? "").localeCompare(String(rightValue ?? ""))
        : String(rightValue ?? "").localeCompare(String(leftValue ?? ""));
    });
    const paged = getPagedRows("dashboard-report-detail", sortedRows);

    return (
      <section className="page-canvas page-canvas--detail">
        <PageHeader
          title={topNavbarContext?.title}
          breadcrumb={topNavbarContext?.breadcrumb}
          onBack={topNavbarContext?.onBack}
          backAriaLabel={topNavbarContext?.backAriaLabel}
        />
        <div className="page-body page-body--report-detail">
          {renderLockedBusinessUnitInfoBox()}
          <div className="dashboard-discount-report">
            <section className="dashboard-discount-report__overview">
              <div className="dashboard-discount-report__metrics">
                {discountReportDetail.metrics.map((metric) => (
                  <DashboardStackedMetricCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    tone={metric.tone}
                  />
                ))}
              </div>
              <DashboardLineChartPanel
                title={discountReportDetail.chart.title}
                copy={discountReportDetail.chart.copy}
                stats={[]}
                yAxisFormatter={(value) =>
                  formatSalesSummaryAxisValue("sales", value)
                }
                tabs={SALES_SUMMARY_RANGE_TABS}
                activeTab={discountReportRange}
                onTabSelect={setDiscountReportRange}
                chartHeight={148}
                minCanvasWidth={0}
                labels={discountReportDetail.chart.labels}
                datasets={discountReportDetail.chart.datasets}
              />
            </section>
            <section className="table-card dashboard-report-detail__table-card">
              <TableToolbar
                filters={null}
                searchPlaceholder="Search discount"
                searchValue={searchValue}
                onSearch={(value) =>
                  handleSetSearch("dashboard-report-detail", value)
                }
              />
              <div
                className="table-scroll"
                data-scroll-top="false"
                onScroll={handleTableCardScroll}
              >
                <table className="lab-table dashboard-report-detail__table">
                  <thead>
                    <tr>
                      {discountReportDetail.columns.map((column) => (
                        <th
                          key={column.key}
                          className={column.align === "right" ? "is-right" : ""}
                        >
                          {column.sortable ? (
                            <button
                              type="button"
                              className={`dashboard-table-sort type-title-3${(column.sortKey ?? column.key) ===
                                salesReportSort.key
                                ? " is-active"
                                : ""
                                }`}
                              onClick={() =>
                                handleSetSalesReportSort(
                                  column.sortKey ?? column.key
                                )
                              }
                            >
                              <span>{column.label}</span>
                              <span
                                className="dashboard-table-sort__icon"
                                aria-hidden="true"
                              >
                                <ChevronIcon
                                  name="filterChevron"
                                  size={16}
                                  color="#C2C2C2"
                                  direction={
                                    (column.sortKey ?? column.key) ===
                                      salesReportSort.key &&
                                      salesReportSort.direction === "desc"
                                      ? "up"
                                      : "down"
                                  }
                                />
                              </span>
                            </button>
                          ) : (
                            <p className="type-title-3">{column.label}</p>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.rows.map((row) => (
                      <tr key={row.id}>
                        {discountReportDetail.columns.map((column) => (
                          <td
                            key={`${row.id}-${column.key}`}
                            className={column.align === "right" ? "is-right" : ""}
                          >
                            <p className="type-subtitle-2">{row[column.key]}</p>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TableFooterBar
                page={paged.page}
                totalPages={paged.totalPages}
                rowsPerPage={rowsPerPage["dashboard-report-detail"] || 25}
                totalRows={filteredRows.length}
                onRowsChange={(value) =>
                  handleSetRowsPerPage("dashboard-report-detail", value)
                }
                onPrev={() => handlePaginate("dashboard-report-detail", "prev")}
                onNext={() => handlePaginate("dashboard-report-detail", "next")}
                onSelectPage={(value) =>
                  handleGoToPage("dashboard-report-detail", value)
                }
                onDownload={() =>
                  showSnackbar("Discount Report export downloaded", "green")
                }
              />
            </section>
          </div>
        </div>
      </section>
    );
  }

  function renderCurrentPage() {
    const renderCategoryListSurface = () => {
      const filteredCategoryRows = getRowsForPage("category");
      const allVisibleCategoryRowsSelected =
        filteredCategoryRows.length > 0 &&
        filteredCategoryRows.every((row) =>
          selectedRows.category.includes(row.id)
        );
      return (
        <CategoryListPage
          renderListPage={(customTable) =>
            renderGenericListPage("category", customTable)
          }
          categoryRows={filteredCategoryRows}
          totalCategoryRows={categoryRows.length}
          searchValue={searchByPage.category}
          selectedRows={selectedRows.category}
          onToggleSelectedRow={(rowId) =>
            handleToggleSelectedRow("category", rowId)
          }
          onRowClick={(rowId) => openCategoryDetailPanel(rowId)}
          categoryDetailId={categoryDetailId}
          config={PAGE_CONFIGS.category}
          allVisibleSelected={allVisibleCategoryRowsSelected}
          onToggleAllRows={() =>
            handleToggleAllRows("category", filteredCategoryRows)
          }
          sortByPage={sortByPage}
          sortDirectionByPage={sortDirectionByPage}
          onSort={(key) => handleSetSort("category", key)}
          handleDelete={(rowId) => {
            const row = categoryRows.find((item) => item.id === rowId);
            if (row?.isDefault) return;
            requestDeleteRow("category", rowId, row?.name ?? rowId);
          }}
        />
      );
    };

    if (currentPage === "dashboard-discount-report-detail")
      return renderDashboardDiscountReportDetailPage();
    if (currentPage === "dashboard-report-detail")
      return renderDashboardReportDetailPage();
    if (currentPage === "catalog-create") return renderCatalogPage();
    if (currentPage === "catalog-detail") return renderCatalogPage();
    if (currentPage === "category-create") return renderCategoryListSurface();
    if (currentPage === "unit-create") return renderGenericListPage("unit");
    if (currentPage === "modifier-create") return renderGenericListPage("modifier");
    if (currentPage === "selling-time-create")
      return renderGenericListPage("selling-time");
    if (currentPage === "device-management-create")
      return renderGenericListPage("device-management");
    if (currentPage === "pricing-rule-create")
      return renderPricingRulePage();
    if (currentPage === "catalog") return renderCatalogPage();
    if (currentPage === "category") return renderCategoryListSurface();
    if (currentPage === "unit")
      return (
        <UnitListPage renderListPage={() => renderGenericListPage("unit")} />
      );
    if (currentPage === "modifier")
      return (
        <ModifierListPage
          renderListPage={() => renderGenericListPage("modifier")}
        />
      );
    if (currentPage === "device-management")
      return (
        <DevicesListPage
          renderListPage={() => renderGenericListPage("device-management")}
        />
      );
    if (
      currentPage === "role-management" ||
      currentPage === "role-management-create" ||
      currentPage === "role-access" ||
      currentPage === "role-access-create"
    ) {
      return renderGenericListPage("role-access");
    }
    if (currentPage === "grouped-device" || currentPage === "grouped-device-create")
      return renderGenericListPage("grouped-device");
    if (currentPage === "pricing-rule") return renderPricingRulePage();
    if (currentPage === "dashboard") return renderDashboardPage();
    if (currentPage === "settings") return renderSettingsPage();
    if (PAGE_CONFIGS[currentPage]) return renderGenericListPage(currentPage);

    return (
      <section className="page-canvas">
        <div className="page-body">
          <EmptyState
            title="This workspace is not configured yet"
            copy="Choose one of the RMS modules from the sidebar."
          />
        </div>
      </section>
    );
  }

  function renderLockedBusinessUnitInfoBox() {
    if (!isLockedSelectedBusinessUnit) return null;

    return (
      <div className="lab-infobox lab-infobox--orange dashboard-lock-banner">
        <div className="dashboard-lock-banner__main">
          <span className="dashboard-lock-banner__icon" aria-hidden="true">
            <Icon name="lock" className="lab-icon lab-icon--20" alt="" />
          </span>
          <div className="dashboard-lock-banner__copy">
            <p className="type-body-bold">Entity is Locked</p>
            <p className="type-body">
              Access to this entity is restricted by the holding administrator. Please <b><u>contact administrator</u></b> for further assistance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const topNavbarContext = (() => {
    switch (currentPage) {
      case "catalog":
      case "catalog-detail":
      case "catalog-create":
        return {
          title: "Catalog",
          actionLabel: "New Catalog",
          onAction: openCatalogCreatePage,
        };
      case "category":
      case "category-create":
        return {
          title: "Category",
          actionLabel: PAGE_CONFIGS.category.actionLabel,
          onAction: openCategoryCreatePage,
        };
      case "unit":
      case "unit-create":
        return {
          title: "Unit",
          actionLabel: PAGE_CONFIGS.unit.actionLabel,
          onAction: openUnitCreatePage,
        };
      case "modifier":
      case "modifier-create":
        return {
          title: "Modifier",
          actionLabel: PAGE_CONFIGS.modifier.actionLabel,
          onAction: openModifierCreatePage,
        };
      case "pricing-rule":
      case "pricing-rule-create":
        return {
          title: "Pricing Rule",
          actionLabel:
            pricingRuleTab === "special"
              ? PAGE_CONFIGS["pricing-rule"].actionLabel
              : null,
          onAction: openPricingRuleCreatePage,
        };
      case "selling-time":
      case "selling-time-create":
        return {
          title: "Selling Time",
          actionLabel: PAGE_CONFIGS["selling-time"].actionLabel,
          onAction: openSellingTimeCreatePage,
        };
      case "dashboard":
        return { title: "Dashboard" };
      case "settings":
        return {
          title: "Settings",
          actionLabel: "Save Changes",
          actionIcon: null,
          onAction: () => showSnackbar("Settings saved successfully", "black"),
        };
      case "dashboard-report-detail":
        return {
          title:
            selectedDashboardReportDetail?.id === "discount-summary"
              ? "Discount Report"
              : selectedDashboardReportDetail?.title ?? "Report Detail",
          breadcrumb: selectedDashboardReportDetail
            ? selectedDashboardReportDetail.id === "discount-summary"
              ? "Dashboard / Discount Report"
              : selectedDashboardReportDetail.id === "inventory-report"
                ? "Dashboard / Inventory Report"
                : `Dashboard / Sales Report / ${selectedDashboardReportDetail.title}`
            : "Dashboard / Report Detail",
          onBack: () => handleSetPage("dashboard"),
          backAriaLabel: "Back to dashboard",
        };
      case "dashboard-discount-report-detail":
        return {
          title: "Discount Report",
          breadcrumb: "Dashboard / Discount Report",
          onBack: () => handleSetPage("dashboard"),
          backAriaLabel: "Back to dashboard",
        };
      case "device-management":
      case "device-management-create":
        return {
          title: "Device List",
          actionLabel: PAGE_CONFIGS["device-management"].actionLabel,
          onAction: openDeviceManagementCreatePage,
        };
      case "grouped-device":
      case "grouped-device-create":
        return {
          title: "KDS Group",
          actionLabel: PAGE_CONFIGS["grouped-device"].actionLabel,
          onAction: openGroupedDeviceCreatePage,
        };
      case "role-management":
      case "role-management-create":
      case "role-access":
      case "role-access-create":
        return {
          title: "Role Management",
          actionLabel: PAGE_CONFIGS["role-access"].actionLabel,
          onAction: openRoleAccessCreatePage,
        };
      default:
        return null;
    }
  })();


  return {
      clearDevicePairingSimulation,
      scheduleDevicePairingSimulation,
      showSnackbar,
      finalizeCreateSuccess,
      resetPage,
      resetDashboardReportDetailControls,
      resetDashboardSortState,
      getSearchValue,
      getNavigationPageId,
      getGroupForPage,
      getCatalogOptions,
      getFilterOptions,
      getDuplicateCategoryNameError,
      getDuplicateUnitNameError,
      getDuplicateModifierNameError,
      getDuplicatePricingRuleNameError,
      getDuplicateDeviceNameError,
      getDuplicateKdsGroupNameError,
      getDuplicateRoleAccessNameError,
      getRoleAccessNameErrors,
      getRoleAccessErrorTab,
      getCategoryDetailContext,
      getPricingOverrideMaximumForUnitFromSections,
      getPricingOverrideMaximumForUnit,
      syncAssignedUnitsWithPricingOverridesFromSections,
      syncAssignedUnitsWithPricingOverrides,
      getPackageTotalForItems,
      getCatalogRows,
      getRowsForPage,
      getPagedRows,
      handleSetPage,
      handleToggleGroup,
      handleSetSearch,
      setCreatePanelStepValue,
      resetCreatePanelStepValue,
      getActiveCreatePanelConfig,
      hasCatalogCreateChanges,
      hasCategoryCreateChanges,
      hasUnitCreateChanges,
      hasSellingTimeCreateChanges,
      hasModifierCreateChanges,
      hasSpecialPricingRuleCreateChanges,
      hasDeviceManagementCreateChanges,
      hasRoleAccessCreateChanges,
      hasCreatePanelChanges,
      resetCreatePanelState,
      cancelDiscardCreateChanges,
      confirmDiscardCreateChanges,
      cancelDiscardEditChanges,
      confirmDiscardEditChanges,
      hasDraftChanges,
      guardCreatePanelNavigation,
      handleSetDashboardReportTimeRange,
      handleSetDashboardReportFilter,
      handleSetInventoryDashboardFilter,
      handleSetInventoryDashboardTab,
      handleSetInventoryReportSort,
      handleSetSalesReportSort,
      handleSetCashManagementSort,
      handleSetFinancialReportSort,
      handleSetDashboardReportCustomDate,
      handleSetDashboardReportDetailView,
      handleNavigateDashboardReportTime,
      getDashboardReportDetailViewForSalesBreakdownTab,
      handleSetSalesPerformanceTimeRange,
      handleSetSalesPerformanceCustomDate,
      handleSetSalesBreakdownTimeRange,
      handleSetSalesBreakdownCustomDate,
      handleSetCashFlowTimeRange,
      handleSetCashFlowCustomDate,
      handleSetFinancialReportTimeRange,
      handleSetFinancialReportCustomDate,
      handleSetPricingRuleTab,
      handleSetDashboardBusinessUnitFilter,
      handleSelectSidebarBusinessUnit,
      handleOpenDashboardReportDetail,
      handleOpenSalesBreakdownDetail,
      handleNavigateSalesSummary,
      handleChangeSalesSummaryComparisonSelection,
      handleSetFilter,
      handleSetSort,
      handleSetRowsPerPage,
      handlePaginate,
      handleGoToPage,
      handleToggleSelectedRow,
      handleToggleAllRows,
      handleToggleCatalogAvailability,
      handleModifierListAvailabilityToggle,
      requestDeleteRow,
      requestDeviceStatusChange,
      cancelDeleteRequest,
      cancelDeviceStatusChange,
      confirmDeleteRow,
      createDeviceManagementTimestamp,
      getDeviceConnectedDisplayValue,
      applyDeviceStatusChange,
      handleDisconnectToDisconnected,
      handleStartDevicePendingPairing,
      confirmDeviceStatusChange,
      closeDevicePairingRequest,
      declineDevicePairingRequest,
      confirmDevicePairingRequest,
      handleDeleteRow,
      handleToggleAllPricingOverrides,
      handleTogglePricingOverrideGroup,
      handleTogglePricingOverrideItem,
      handleStartPricingOverrideEdit,
      handleChangePricingOverrideEdit,
      handleCancelPricingOverrideEdit,
      handleSavePricingOverrideEdit,
      handleDownloadPage,
      handleSettingChange,
      handleSettingToggle,
      buildCatalogRecordForStorage,
      persistCatalogDetailDraft,
      resetCatalogDetailState,
      openCatalogDetailPage,
      closeCatalogDetailPage,
      persistCategoryDetailDraft,
      resetCategoryDetailState,
      persistUnitDetailDraft,
      resetUnitDetailState,
      resetSellingTimeDetailState,
      clearSellingTimeDetailError,
      clearSellingTimeDetailErrorsByPrefix,
      openSellingTimeDetailPanel,
      closeSellingTimeDetailPanel,
      buildSellingTimeDetailRecordForStorage,
      persistSellingTimeDetailDraft,
      commitPricingRuleDetailEdit,
      startPricingRuleDetailEdit,
      beginPricingRuleDetailEdit,
      cancelPricingRuleDetailEdit,
      executeCancelPricingRuleDetailEdit,
      savePricingRuleDetailEdit,
      handlePricingRuleDetailChange,
      handlePricingRuleDetailMaximumChange,
      commitSellingTimeDetailEdit,
      startSellingTimeDetailEdit,
      beginSellingTimeDetailEdit,
      cancelSellingTimeDetailEdit,
      executeCancelSellingTimeDetailEdit,
      saveSellingTimeDetailEdit,
      handleSellingTimeDetailChange,
      handleToggleSellingTimeDetailDay,
      updateSellingTimeDetailDay,
      handleSellingTimeDetailToggle24Hours,
      handleSellingTimeDetailSlotChange,
      handleAddSellingTimeDetailSlot,
      handleRemoveSellingTimeDetailSlot,
      buildModifierRecordForStorage,
      persistModifierDetailDraft,
      resetModifierDetailState,
      openModifierDetailPanel,
      closeModifierDetailPanel,
      handleRemoveModifierDetailAssignedUnit,
      commitModifierDetailEdit,
      startModifierDetailEdit,
      beginModifierDetailEdit,
      cancelModifierDetailEdit,
      executeCancelModifierDetailEdit,
      saveModifierDetailEdit,
      handleModifierDetailChange,
      handleToggleModifierDetailAvailability,
      handleModifierDetailOptionChange,
      handleModifierDetailAssignedUnitChange,
      handleAddModifierDetailOption,
      handleRemoveModifierDetailOption,
      openCategoryDetailPanel,
      closeCategoryDetailPanel,
      openUnitDetailPanel,
      closeUnitDetailPanel,
      commitCategoryDetailEdit,
      startCategoryDetailEdit,
      beginCategoryDetailEdit,
      cancelCategoryDetailEdit,
      executeCancelCategoryDetailEdit,
      saveCategoryDetailEdit,
      handleCategoryDetailChange,
      handleCategoryDetailSingleSelectSave,
      commitUnitDetailEdit,
      startUnitDetailEdit,
      beginUnitDetailEdit,
      cancelUnitDetailEdit,
      executeCancelUnitDetailEdit,
      saveUnitDetailEdit,
      handleUnitDetailChange,
      handleUnitDetailSingleSelectSave,
      syncTableCardScrollState,
      handleTableCardScroll,
      syncCatalogDetailPanelTableScroll,
      handleCatalogDetailPanelTableScroll,
      commitCatalogDetailEdit,
      startCatalogDetailEdit,
      beginCatalogDetailEdit,
      beginCatalogDetailAssignmentEdit,
      cancelCatalogDetailEdit,
      executeCancelCatalogDetailEdit,
      saveCatalogDetailEdit,
      handleCatalogDetailChange,
      handleCatalogDetailSingleSelectSave,
      handleCatalogDetailTypeSave,
      handleToggleCatalogDetailAvailability,
      handleCatalogDetailPhotoUpload,
      handleSetMainCatalogDetailPhoto,
      handleRemoveCatalogDetailPhoto,
      handleCatalogDetailPackageItemChange,
      handleCatalogDetailAssignedUnitChange,
      handleCatalogDetailIngredientChange,
      handleRemoveCatalogDetailIngredient,
      handleAddCatalogDetailAdditionalName,
      handleCatalogDetailAdditionalNameChange,
      handleRemoveCatalogDetailAdditionalName,
      handleRemoveCatalogDetailPackageItem,
      handleRemoveCatalogDetailAssignedUnit,
      clearCatalogDraftError,
      resetCatalogDraft,
      clearCategoryDraftError,
      resetCategoryDraft,
      clearUnitDraftError,
      resetUnitDraft,
      clearCategoryDetailError,
      clearUnitDetailError,
      clearModifierDetailError,
      clearPricingRuleDetailError,
      clearDeviceManagementDraftError,
      resetDeviceManagementDraft,
      resetGroupedDeviceDraft,
      clearGroupedDeviceDraftError,
      clearGroupedDeviceDetailDraftError,
      openCategoryCreatePage,
      openUnitCreatePage,
      openRoleAccessCreatePage,
      closeRoleAccessCreatePage,
      resetRoleAccessDraft,
      resetRoleAccessDetailState,
      openRoleAccessDetailPanel,
      goToRoleAccessCreateRmsTab,
      goToRoleAccessDetailRmsTab,
      saveRoleAccessDraft,
      saveRoleAccessDetailEdit,
      cancelRoleAccessDetailEdit,
      handleRoleAccessChange,
      openDeviceManagementCreatePage,
      openGroupedDeviceCreatePage,
      closeGroupedDeviceCreatePage,
      openGroupedDeviceDetailPanel,
      closeCategoryCreatePage,
      closeUnitCreatePage,
      closeDeviceManagementCreatePage,
      handleCategoryDraftChange,
      handleUnitDraftChange,
      clearSellingTimeDraftError,
      clearSellingTimeDraftErrorsByPrefix,
      resetSellingTimeDraft,
      openSellingTimeCreatePage,
      closeSellingTimeCreatePage,
      handleSellingTimeDraftNameChange,
      updateSellingTimeDay,
      handleToggleSellingTimeDay,
      handleToggleSellingTimeTwentyFourHours,
      handleSellingTimeSlotChange,
      handleAddSellingTimeSlot,
      handleRemoveSellingTimeSlot,
      clearSpecialPricingRuleDraftError,
      resetSpecialPricingRuleDraft,
      buildPricingRuleDetailRecordForStorage,
      persistPricingRuleDetailDraft,
      resetPricingRuleDetailState,
      openPricingRuleDetailPanel,
      closePricingRuleDetailPanel,
      openPricingRuleCreatePage,
      closePricingRuleCreatePage,
      handleSpecialPricingRuleDraftChange,
      handleToggleAllSpecialPricingRuleOverrides,
      handleToggleSpecialPricingRuleGroup,
      handleToggleSpecialPricingRuleItem,
      handleSpecialPricingRuleMaximumChange,
      clearModifierDraftError,
      resetModifierDraft,
      openModifierCreatePage,
      closeModifierCreatePage,
      handleModifierDraftChange,
      handleModifierOptionChange,
      handleAddModifierOption,
      handleRemoveModifierOption,
      handleRemoveModifierAssignedUnit,
      handleModifierOptionDragStart,
      handleModifierOptionDragOver,
      handleModifierOptionDrop,
      handleModifierOptionDragEnd,
      handleModifierDetailOptionDragStart,
      handleModifierDetailOptionDragOver,
      handleModifierDetailOptionDrop,
      handleModifierDetailOptionDragEnd,
      handleSaveCategoryDraft,
      handleSaveUnitDraft,
      handleSaveSellingTimeDraft,
      handleSaveSpecialPricingRuleDraft,
      getSellingTimeCreateStepErrors,
      handleSellingTimeCreateStepSelect,
      getSpecialPricingRuleCreateStepErrors,
      handleSpecialPricingRuleCreateStepSelect,
      handleSaveModifierDraft,
      getModifierCreateStepErrors,
      handleModifierCreateStepSelect,
      openCatalogCreatePage,
      closeCatalogCreatePage,
      handleCatalogDraftChange,
      handleCatalogTypeChange,
      handleCatalogPhotoUpload,
      handleRemoveCatalogPhoto,
      handleSetMainCatalogPhoto,
      handlePackageItemChange,
      handleRemovePackageItem,
      handleIngredientChange,
      handleRemoveIngredient,
      handleAddAdditionalName,
      handleAdditionalNameChange,
      handleRemoveAdditionalName,
      openUnitAssignmentModal,
      closeUnitAssignmentModal,
      openModifierCatalogModal,
      closeModifierCatalogModal,
      confirmModifierCatalogModal,
      handleToggleUnitAssignment,
      handleToggleUnitAssignmentGroup,
      handleAssignAllUnits,
      handleConfirmUnitAssignment,
      handleRemoveAssignedUnit,
      getCatalogCreateStepErrors,
      handleCatalogCreateNextStep,
      handleCatalogCreateStepSelect,
      handleSaveCatalogDraft,
      renderModifierCreatePage,
      renderCategoryCreatePage,
      renderSellingTimeCreatePage,
      renderPricingRuleCreatePage,
      renderCatalogCreatePage,
      renderCategoryCreateSidePanel,
      renderUnitCreateSidePanel,
      renderModifierCreateSidePanel,
      renderSellingTimeCreateSidePanel,
      renderPricingRuleCreateSidePanel,
      renderCatalogCreateSidePanel,
      getCatalogDetailViewModel,
      renderCatalogDetailGeneralPanel,
      renderCatalogDetailUnitAssignmentPanel,
      renderCatalogDetailSidePanel,
      renderCatalogDetailPage,
      renderCatalogPage,
      renderCategoryDetailSidePanel,
      renderUnitDetailSidePanel,
      renderSellingTimeDetailSidePanel,
      renderModifierDetailSidePanel,
      renderPricingRuleDetailSidePanel,
      renderPricingRulePage,
      renderGenericListPage,
      cancelDeviceManagementDetailEdit,
      executeCancelDeviceManagementDetailEdit,
      saveDeviceManagementDetailEdit,
      openDeviceManagementDetailPanel,
      handleSaveDeviceManagementDraft,
      handleSaveGroupedDeviceDraft,
      renderGroupedDeviceCreateSidePanel,
      renderGroupedDeviceDetailSidePanel,
      saveGroupedDeviceDetailEdit,
      cancelGroupedDeviceDetailEdit,
      renderRoleAccessCreateSidePanel,
      renderRoleAccessDetailSidePanel,
      renderDeviceManagementCreateSidePanel,
      renderDeviceManagementDetailSidePanel,
      renderDashboardPage,
      renderSettingsPage,
      renderDashboardReportDetailPage,
      renderDashboardDiscountReportDetailPage,
      renderCurrentPage,
      renderLockedBusinessUnitInfoBox,
    deferredCurrentSearch,
    selectedSidebarBusinessUnit,
    isLockedSelectedBusinessUnit,
    categoryRows,
    modifierRows,
    unitRows,
    sellingTimeRows,
    catalogCategoryOptions,
    catalogUnitOptions,
    modifierCatalogGroups,
    baseGroupedDeviceCatalogGroups,
    groupedDeviceGroups,
    groupedDeviceCatalogValues,
    groupedDeviceUnassignedCatalogList,
    groupedDeviceUnassignedCatalogCount,
    hasGroupedDeviceGroups,
    catalogModifierOptions,
    catalogSellingTimeOptions,
    catalogRoutingOptions,
    packageCatalogOptions,
    packageCatalogMap,
    selectedSellingTimeDetailRow,
    selectedPricingRuleDetailRow,
    selectedCategoryDetailRow,
    selectedUnitDetailRow,
    selectedModifierDetailRow,
    selectedDeviceManagementDetailRow,
    selectedGroupedDeviceDetailRow,
    groupedDeviceCreateCatalogGroups,
    groupedDeviceDetailCatalogGroups,
    selectedRoleAccessDetailRow,
    categoryParentOptions,
  };
}
