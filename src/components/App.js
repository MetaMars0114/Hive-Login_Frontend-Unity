import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import MainPage from "./MainPage";
import { toast } from 'react-toastify';
toast.configure({
    autoClose: 2500,
});

class App extends React.Component {
    render() {

        return (
            <Router>
                <Route path={`/`} exact component={MainPage} />
            </Router>
        )
    }
}

export default App;