import { useCallback, useReducer, useRef } from "react";
import { actions, useGetLatest, loopHooks } from "../utils";

const getHeaders = (columns) => {
  let headers = [];

  columns.map((col) =>
    headers.push({
      ...col,
      render: () =>
        typeof col.header === "function" ? col.header(col) : col.header
    })
  );

  return headers;
};

const getRows = (data, columns) => {
  let rows = [];

  data.map((item) => {
    const cells = [];
    let newItem = {};
    columns.map((col) => {
      newItem[col.accessor] = item[col.accessor];
      cells.push({
        render: () => (col.cell ? col.cell(item, col) : item[col.accessor])
      });

      return col;
    });

    newItem.cells = cells;
    rows.push(newItem);
    return rows;
  });

  return rows;
};

const defaultInitialState = {};
const defaultReducer = (state, action, prevState) => state;

function applyDefaults(props = {}) {
  return {
    initialState: defaultInitialState,
    stateReducer: defaultReducer,
    data: props.data || [],
    columns: props.columns || [],
    ...props
  };
}

function defaultGetHeaderProps(props, column) {
  return {
    key: `header_${column.accessor}`,
    role: "columnheader",
    ...props
  };
}

function reduceHeaderHooks(hooks, header) {
  return hooks.reduce((acc, next) => next(acc, header), {});
}

function makeHeadersProps(hooks, instance) {
  const headers = instance.headers;
  headers.map((header) => {
    const headerProps = reduceHeaderHooks(hooks, header);
    header.getHeaderProps = () => headerProps;
    return header;
  });
}

function makeDefaultPluginsHooks() {
  return {
    stateReducers: [],
    useInstance: [],
    headerProps: [defaultGetHeaderProps]
  };
}

export function useTable(props, ...plugins) {
  props = applyDefaults(props);
  const instanceRef = useRef({});

  const getInstance = useGetLatest(instanceRef.current);

  Object.assign(getInstance(), {
    ...props,
    rows: getRows(props.data, props.columns),
    headers: getHeaders(props.columns),
    hooks: makeDefaultPluginsHooks()
  });

  const getHooks = useGetLatest(getInstance().hooks);

  // Allow plugins to register hooks as early as possible
  plugins.filter(Boolean).forEach((plugin) => plugin(getHooks()));

  makeHeadersProps(getHooks().headerProps, getInstance());

  const { initialState, stateReducer } = getInstance();
  // Setup user reducer ref
  const getStateReducer = useGetLatest(stateReducer);

  // Build the reducer
  const reducer = useCallback(
    (state, action) => {
      // Detect invalid actions
      if (!action.type) {
        console.info({ action });
        throw new Error("Unknown Action 👆");
      }

      // Reduce the state from all plugin reducers
      return [...getHooks().stateReducers, getStateReducer()].reduce(
        (accState, handler) =>
          handler(accState, action, state, getInstance() || accState),
        state
      );
    },
    [getHooks, getStateReducer, getInstance]
  );

  // Start the reducer
  const [reducerState, dispatch] = useReducer(reducer, undefined, () =>
    reducer(initialState, { type: actions.init })
  );

  Object.assign(getInstance(), {
    state: reducerState,
    dispatch
  });

  loopHooks(getHooks().useInstance, getInstance());

  return getInstance();
}
