import { useState, useRef, useDeferredValue, useEffect } from "react";
import {
  ALL_BUSINESS_UNITS_LABEL,
  createInitialDashboardReportTrendOffsets,
  createInitialSalesSummaryComparisonSelectionState,
  createInitialSalesSummaryNavigationState,
} from "../constants/dashboard.js";
import { INITIAL_SETTINGS_FORM } from "../constants/settings.js";
import { createInitialSearchState, createInitialFiltersState, createInitialRowsPerPageState, createInitialPageState, createInitialSelectedRowsState } from "../utils/dataStoreUtils.js";
import { cloneDataStore } from "../utils/reportFilterUtils.js";
import { createInitialCatalogDraft, createInitialSellingTimeDraft } from "../utils/catalogDraftUtils.js";
import { createInitialCategoryDraft, createInitialModifierDraft } from "../utils/modifierUtils.js";
import { createInitialUnitDraft, createInitialDeviceManagementDraft } from "../utils/detailDraftUtils.js";
import { createInitialGroupedDeviceDraft } from "../utils/deviceGroupUtils.js";
import { createDefaultPricingOverrideSections, createInitialSpecialPricingRuleDraft } from "../utils/pricingUtils.js";
import { createInitialRoleAccessDraft } from "../utils/roleUtils.js";

export function useAppState() {
  const [records, setRecords] = useState(cloneDataStore);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedSidebarBusinessUnitId, setSelectedSidebarBusinessUnitId] =
    useState(null);
  const [dashboardReportTab, setDashboardReportTab] = useState("sales-report");
  const [dashboardBusinessUnitFilter, setDashboardBusinessUnitFilter] =
    useState(ALL_BUSINESS_UNITS_LABEL);
  const [dashboardReportDetailId, setDashboardReportDetailId] = useState(null);
  const [dashboardReportDetailView, setDashboardReportDetailView] =
    useState("by-item");
  const [dashboardReportTrendRange, setDashboardReportTrendRange] =
    useState("hourly");
  const [dashboardReportTrendOffsets, setDashboardReportTrendOffsets] =
    useState(createInitialDashboardReportTrendOffsets);
  const [dashboardReportTimeRange, setDashboardReportTimeRange] =
    useState("Today");
  const [dashboardReportCustomRange, setDashboardReportCustomRange] = useState({
    start: "",
    end: "",
  });
  const [dashboardReportFilters, setDashboardReportFilters] = useState({
    category: [],
    discount: [],
    ingredient: [],
    movementType: [],
    updatedBy: [],
    shift: [],
    orderType: [],
    payment: [],
    staff: [],
    status: [],
  });
  const [inventoryReportSort, setInventoryReportSort] = useState({
    key: "currentStockValue",
    direction: "asc",
  });
  const [salesReportSort, setSalesReportSort] = useState({
    key: "dateTime",
    direction: "desc",
  });
  const [cashManagementSort, setCashManagementSort] = useState({
    key: "dateTime",
    direction: "desc",
  });
  const [financialReportSort, setFinancialReportSort] = useState({
    key: "dateValue",
    direction: "desc",
  });
  const [inventoryDashboardTab, setInventoryDashboardTab] =
    useState("stock-level");
  const [inventoryDashboardFilters, setInventoryDashboardFilters] = useState({
    category: [],
    ingredient: [],
    movementType: [],
    status: [],
    updatedBy: [],
  });
  const [salesPerformanceTimeRange, setSalesPerformanceTimeRange] =
    useState("Today");
  const [salesPerformanceCustomRange, setSalesPerformanceCustomRange] =
    useState({
      start: "",
      end: "",
    });
  const [salesBreakdownTimeRange, setSalesBreakdownTimeRange] =
    useState("Today");
  const [salesBreakdownCustomRange, setSalesBreakdownCustomRange] = useState({
    start: "",
    end: "",
  });
  const [discountReportRange, setDiscountReportRange] = useState("hourly");
  const [salesSummaryRange, setSalesSummaryRange] = useState("hourly");
  const [salesSummaryMetric, setSalesSummaryMetric] = useState("sales");
  const [salesSummaryMode, setSalesSummaryMode] = useState("trend");
  const [salesSummaryComparisonSelection, setSalesSummaryComparisonSelection] =
    useState(createInitialSalesSummaryComparisonSelectionState);
  const [salesSummaryNavigation, setSalesSummaryNavigation] = useState(
    createInitialSalesSummaryNavigationState
  );
  const [salesPerformanceTab, setSalesPerformanceTab] = useState("item-qty");
  const [salesBreakdownTab, setSalesBreakdownTab] = useState("business-unit");
  const [cashFlowTimeRange, setCashFlowTimeRange] = useState("Today");
  const [cashFlowCustomRange, setCashFlowCustomRange] = useState({
    start: "",
    end: "",
  });
  const [financialReportTimeRange, setFinancialReportTimeRange] =
    useState("Today");
  const [financialReportCustomRange, setFinancialReportCustomRange] = useState({
    start: "",
    end: "",
  });
  const [financialExpenseCategoryFilters, setFinancialExpenseCategoryFilters] =
    useState([]);
  const [cashManagementTableTab, setCashManagementTableTab] =
    useState("cash-flow");
  const [cashManagementShiftFilters, setCashManagementShiftFilters] = useState([]);
  const [cashFlowTypeFilters, setCashFlowTypeFilters] = useState([]);
  const [cashFlowCreatedByFilters, setCashFlowCreatedByFilters] = useState([]);
  const [cashDropProcessedByFilters, setCashDropProcessedByFilters] =
    useState([]);
  const [cashAuditVerifiedByFilters, setCashAuditVerifiedByFilters] =
    useState([]);
  const [pricingRuleTab, setPricingRuleTab] = useState("default");
  const [pricingRuleDetailId, setPricingRuleDetailId] = useState(null);
  const [pricingRuleDetailPanelTab, setPricingRuleDetailPanelTab] =
    useState("general");
  const [pricingRuleDetailDraft, setPricingRuleDetailDraft] = useState(null);
  const [pricingRuleDetailEditing, setPricingRuleDetailEditing] =
    useState(null);
  const [pricingRuleDetailSnapshot, setPricingRuleDetailSnapshot] =
    useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [searchByPage, setSearchByPage] = useState(createInitialSearchState);
  const [filtersByPage, setFiltersByPage] = useState(createInitialFiltersState);
  const [sortByPage, setSortByPage] = useState({});
  const [sortDirectionByPage, setSortDirectionByPage] = useState({});
  const [rowsPerPage, setRowsPerPage] = useState(createInitialRowsPerPageState);
  const [pageByPage, setPageByPage] = useState(createInitialPageState);
  const [selectedRows, setSelectedRows] = useState(
    createInitialSelectedRowsState
  );
  const [selectedPricingOverrides, setSelectedPricingOverrides] = useState({
    catalog: [],
    modifier: [],
  });
  const [pricingOverridesBySection, setPricingOverridesBySection] = useState(
    createDefaultPricingOverrideSections
  );
  const [pricingOverrideEditing, setPricingOverrideEditing] = useState(null);
  const [specialPricingRuleDraft, setSpecialPricingRuleDraft] = useState(
    createInitialSpecialPricingRuleDraft
  );
  const [specialPricingRuleDraftErrors, setSpecialPricingRuleDraftErrors] =
    useState({});
  const [snackbar, setSnackbar] = useState(null);
  const [settingsForm, setSettingsForm] = useState(() => ({
    ...INITIAL_SETTINGS_FORM,
  }));
  const [catalogDraft, setCatalogDraft] = useState(createInitialCatalogDraft);
  const [catalogDraftErrors, setCatalogDraftErrors] = useState({});
  const [categoryDraft, setCategoryDraft] = useState(
    createInitialCategoryDraft
  );
  const [categoryDraftErrors, setCategoryDraftErrors] = useState({});
  const [unitDraft, setUnitDraft] = useState(createInitialUnitDraft);
  const [unitDraftErrors, setUnitDraftErrors] = useState({});
  const [sellingTimeDraft, setSellingTimeDraft] = useState(
    createInitialSellingTimeDraft
  );
  const [sellingTimeDraftErrors, setSellingTimeDraftErrors] = useState({});
  const [modifierDraft, setModifierDraft] = useState(
    createInitialModifierDraft
  );
  const [modifierDraftErrors, setModifierDraftErrors] = useState({});
  const [deviceManagementDraft, setDeviceManagementDraft] = useState(
    createInitialDeviceManagementDraft
  );
  const [deviceManagementDraftErrors, setDeviceManagementDraftErrors] = useState({});
  const [groupedDeviceDraft, setGroupedDeviceDraft] = useState(
    createInitialGroupedDeviceDraft
  );
  const [groupedDeviceDraftErrors, setGroupedDeviceDraftErrors] = useState({});
  const [groupedDeviceDetailDraftErrors, setGroupedDeviceDetailDraftErrors] = useState({});
  const [createPanelSteps, setCreatePanelSteps] = useState({
    catalog: 0,
    category: 0,
    unit: 0,
    modifier: 0,
    "pricing-rule": 0,
    "selling-time": 0,
  });
  const [discardCreateModalOpen, setDiscardCreateModalOpen] = useState(false);
  const [discardEditModalOpen, setDiscardEditModalOpen] = useState(false);
  const discardEditActionRef = useRef(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteConfirmationTarget, setDeleteConfirmationTarget] = useState({
    pageId: null,
    rowId: null,
    itemLabel: "",
    message: null,
  });
  const [deleteBlockedModal, setDeleteBlockedModal] = useState({ open: false, title: "", message: "" });
  const [modifierOptionDeactivateConfirm, setModifierOptionDeactivateConfirm] = useState(null);
  const [deviceStatusConfirmation, setDeviceStatusConfirmation] = useState({
    rowId: null,
    deviceName: "",
    nextStatus: "Disconnected",
    disconnectLabel: "Disconnect",
  });
  const [pairingCodePopup, setPairingCodePopup] = useState(null);
  const [devicePairingRequest, setDevicePairingRequest] = useState(null);
  const [modifierDragOverOptionId, setModifierDragOverOptionId] =
    useState(null);
  const [isUnitAssignmentModalOpen, setIsUnitAssignmentModalOpen] =
    useState(false);
  const [unitAssignmentSearch, setUnitAssignmentSearch] = useState("");
  const [assignedUnitAssignmentIds, setAssignedUnitAssignmentIds] = useState(
    []
  );
  const [selectedUnitAssignmentIds, setSelectedUnitAssignmentIds] = useState(
    []
  );
  const [unitAssignmentTarget, setUnitAssignmentTarget] = useState("create");
  const [modifierCatalogModalTarget, setModifierCatalogModalTarget] =
    useState(null);
  const [modifierCatalogModalValue, setModifierCatalogModalValue] = useState([]);
  const [isModifierCatalogModalOpen, setIsModifierCatalogModalOpen] = useState(false);
  const [isUnroutedCatalogModalOpen, setIsUnroutedCatalogModalOpen] = useState(false);
  const [categoryDetailId, setCategoryDetailId] = useState(null);
  const [categoryDetailDraft, setCategoryDetailDraft] = useState(null);
  const [categoryDetailEditing, setCategoryDetailEditing] = useState(null);
  const [categoryDetailSnapshot, setCategoryDetailSnapshot] = useState(null);
  const [categoryDetailErrors, setCategoryDetailErrors] = useState({});
  const [unitDetailId, setUnitDetailId] = useState(null);
  const [unitDetailDraft, setUnitDetailDraft] = useState(null);
  const [unitDetailEditing, setUnitDetailEditing] = useState(null);
  const [unitDetailSnapshot, setUnitDetailSnapshot] = useState(null);
  const [unitDetailErrors, setUnitDetailErrors] = useState({});
  const [sellingTimeDetailId, setSellingTimeDetailId] = useState(null);
  const [sellingTimeDetailDraft, setSellingTimeDetailDraft] = useState(null);
  const [sellingTimeDetailEditing, setSellingTimeDetailEditing] =
    useState(null);
  const [sellingTimeDetailSnapshot, setSellingTimeDetailSnapshot] =
    useState(null);
  const [sellingTimeDetailErrors, setSellingTimeDetailErrors] = useState({});
  const [modifierDetailId, setModifierDetailId] = useState(null);
  const [groupedDeviceDetailId, setGroupedDeviceDetailId] = useState(null);
  const [groupedDeviceDetailDraft, setGroupedDeviceDetailDraft] = useState(null);
  const [groupedDeviceDetailEditing, setGroupedDeviceDetailEditing] = useState(null);
  const [roleAccessDetailId, setRoleAccessDetailId] = useState(null);
  const [roleAccessDetailDraft, setRoleAccessDetailDraft] = useState(null);
  const [roleAccessDetailEditing, setRoleAccessDetailEditing] = useState(null);
  const [roleAccessDetailSnapshot, setRoleAccessDetailSnapshot] = useState(null);
  const [roleAccessDetailErrors, setRoleAccessDetailErrors] = useState({});
  const [roleAccessDetailPanelTab, setRoleAccessDetailPanelTab] = useState("general");
  const [roleAccessCreatePanelTab, setRoleAccessCreatePanelTab] = useState("general");
  const [isRoleUserAssignModalOpen, setIsRoleUserAssignModalOpen] = useState(false);
  const [roleAccessDraft, setRoleAccessDraft] = useState(createInitialRoleAccessDraft);
  const [roleAccessDraftErrors, setRoleAccessDraftErrors] = useState({});
  const [deviceManagementDetailId, setDeviceManagementDetailId] = useState(null);
  const [deviceManagementDetailEditing, setDeviceManagementDetailEditing] = useState(null);
  const [deviceManagementDetailPanelTab, setDeviceManagementDetailPanelTab] =
    useState("general");
  const deviceManagementDetailEditingRef = useRef(null);
  const [modifierDetailPanelTab, setModifierDetailPanelTab] =
    useState("general");
  const [modifierDetailDraft, setModifierDetailDraft] = useState(null);
  const [modifierDetailEditing, setModifierDetailEditing] = useState(null);
  const [modifierDetailSnapshot, setModifierDetailSnapshot] = useState(null);
  const [modifierDetailErrors, setModifierDetailErrors] = useState({});
  const [pricingRuleDetailErrors, setPricingRuleDetailErrors] = useState({});
  const [deviceManagementDetailErrors, setDeviceManagementDetailErrors] = useState({});
  const [catalogDetailDraft, setCatalogDetailDraft] = useState(null);
  const [catalogDetailPanelTab, setCatalogDetailPanelTab] = useState("general");
  const [catalogDetailEditing, setCatalogDetailEditing] = useState(null);
  const [catalogDetailSnapshot, setCatalogDetailSnapshot] = useState(null);
  const [catalogDetailDraftErrors, setCatalogDetailDraftErrors] = useState({});
  const catalogPhotoInputRef = useRef(null);
  const catalogPhotoStateRef = useRef(catalogDraft.photos);
  const catalogDetailPhotoInputRef = useRef(null);
  const catalogDetailPhotoStateRef = useRef([]);
  const deviceManagementDetailDraftRef = useRef(null);
  const categoryDetailDraftRef = useRef(null);
  const categoryDetailEditingRef = useRef(null);
  const categoryDetailSnapshotRef = useRef(null);
  const unitDetailDraftRef = useRef(null);
  const unitDetailEditingRef = useRef(null);
  const unitDetailSnapshotRef = useRef(null);
  const pricingRuleDetailDraftRef = useRef(null);
  const pricingRuleDetailEditingRef = useRef(null);
  const pricingRuleDetailSnapshotRef = useRef(null);
  const sellingTimeDetailDraftRef = useRef(null);
  const sellingTimeDetailEditingRef = useRef(null);
  const sellingTimeDetailSnapshotRef = useRef(null);
  const modifierDetailDraftRef = useRef(null);
  const modifierDetailEditingRef = useRef(null);
  const modifierDetailSnapshotRef = useRef(null);
  const catalogDetailDraftRef = useRef(null);
  const catalogDetailEditingRef = useRef(null);
  const catalogDetailSnapshotRef = useRef(null);
  const catalogDetailPackageTableScrollRef = useRef(null);
  const catalogDetailAssignmentTableScrollRef = useRef(null);
  const pricingOverrideInputRef = useRef(null);
  const modifierDraggedOptionIdRef = useRef(null);
  const pendingCreateNavigationRef = useRef(null);
  const pendingRoleAccessDetailIdRef = useRef(null);
  const devicePairingRequestTimerRef = useRef({});

  return {
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
    isRoleUserAssignModalOpen,
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
    setIsRoleUserAssignModalOpen,
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
  };
}
