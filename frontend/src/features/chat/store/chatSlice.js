const initialState = {
  conversations: [],
  messages: [],
  loading: false,
  error: null,
};

export default function chatReducer(state = initialState, action) {
  switch (action.type) {
    case 'chat/messages/load':
      return { ...state, messages: action.payload };
    case 'chat/conversations/load':
      return { ...state, conversations: action.payload };
    default:
      return state;
  }
}
