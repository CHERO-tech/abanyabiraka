const initialState = {
  workers: [],
  selectedWorker: null,
  loading: false,
  error: null,
};

export default function workerReducer(state = initialState, action) {
  switch (action.type) {
    case 'workers/load':
      return { ...state, workers: action.payload };
    case 'workers/select':
      return { ...state, selectedWorker: action.payload };
    default:
      return state;
  }
}
