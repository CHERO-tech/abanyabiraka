const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case 'auth/login':
      return { ...state, user: action.payload.user, token: action.payload.token };
    case 'auth/logout':
      return { ...initialState };
    default:
      return state;
  }
}
