const encodeGetParams = (p) => Object.entries(p).map(kv => kv.map(encodeURIComponent).join("=")).join("&");

const truncate = ( str, n, useWordBoundary ) => {
	if (!str || str.length <= n) { return str; }
	const subString = str.substr(0, n-1); // the original check
	return (useWordBoundary
		? subString.substr(0, subString.lastIndexOf(" "))
		: subString) + " ...";
};

export {encodeGetParams, truncate};
