const initialState = {
  bookings: [],
  activeBooking: null,
  loading: false,
  error: null,
};

export default function bookingReducer(state = initialState, action) {
  switch (action.type) {
    case 'booking/create':
      return { ...state, activeBooking: action.payload };
    case 'booking/load':
      return { ...state, bookings: action.payload };
    default:
      return state;
  }
}
