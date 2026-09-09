const initialState = {
  stats: null,
  approvals: [],
  reports: [],
  loading: false,
  error: null,
};

export default function adminReducer(state = initialState, action) {
  switch (action.type) {
    case 'admin/stats/load':
      return { ...state, stats: action.payload };
    case 'admin/approvals/load':
      return { ...state, approvals: action.payload };
    case 'admin/reports/load':
      return { ...state, reports: action.payload };
    default:
      return state;
  }
}
