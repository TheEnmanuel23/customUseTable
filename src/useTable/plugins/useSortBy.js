const actions = {
  headerClick: "header-click"
};

export const useSortBy = (hooks) => {
  hooks.headerProps.push(headerSortByProps);
  hooks.stateReducers.push(reducer);
  hooks.useInstance.push(useInstance);
};

function headerSortByProps(props, column) {
  return {
    onClick: () => column.toggleSortBy({ col: column.header }),
    style: { cursor: "pointer" },
    ...props
  };
}

function reducer(state, action, previousState, instance) {
  if (action.type === actions.headerClick) {
    return { ...state, rows: [] };
  }
}

function useInstance(instance) {
  const { headers, dispatch } = instance;
  headers.forEach(
    (header) =>
      (header.toggleSortBy = (payload = {}) =>
        dispatch({ type: actions.headerClick, payload }))
  );
}
