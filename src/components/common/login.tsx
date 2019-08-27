import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { AuthOpts } from '../../services/userAuth';
import { login } from '../../store/user/actions';
import { UserState } from '../../util/types';

interface DispatchProps {
    onLogin: (user: string, email: string, password: string) => Promise<AuthOpts>;
}

type Props = UserState & DispatchProps;

class LoginModal extends React.Component<Props, UserState> {
    constructor(props: any) {
        super(props);

        // reset login status
        // this.props.logout();
        this.state = {
            token: '',
            email: '',
            userId: 0,
            password: '',
            name: '',
            submitted: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public handleChange(e: any): void {
        const { name, value } = e.target;
        this.setState({ [name]: value } as UserState);
    }

    public handleSubmit(e: any): void {
        e.preventDefault();

        this.setState({ submitted: true });
        const { name, email, password } = this.state;
        if (email && password) {
            this.props.onLogin(name, email, password);
        }
    }

    public render = () => {
        const { email, password, submitted } = this.state;
        return (
            <div className="col-md-6 col-md-offset-3">
                <h2>Login</h2>
                <form name="form" onSubmit={this.handleSubmit}>
                    <div className={'form-group' + (submitted && !email ? ' has-error' : '')}>
                        <label htmlFor="email">email</label>
                        <input
                            type="text"
                            className="form-control"
                            name="email"
                            value={email}
                            onChange={this.handleChange}
                        />
                        {submitted && !email && <div className="help-block">email is required</div>}
                    </div>
                    <div className={'form-group' + (submitted && !password ? ' has-error' : '')}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            name="password"
                            value={password}
                            onChange={this.handleChange}
                        />
                        {submitted && !password && <div className="help-block">Password is required</div>}
                    </div>
                    <div className="form-group">
                        <button className="btn btn-primary">Login</button>
                        <Link to="/register" className="btn btn-link">
                            Register
                        </Link>
                    </div>
                </form>
            </div>
        );
    };
}

// const mapStateToProps = (state: StoreState): StateProps => {
//     return {
//         openSellOrders: getOpenSellOrders(state),
//         openBuyOrders: getOpenBuyOrders(state),
//     };
// };

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        onLogin: (user: string, email: string, password: string) => dispatch(login(user, email, password)),
    };
};

const LoginModalContainer = connect(
    null,
    mapDispatchToProps,
)(LoginModal);

export { LoginModalContainer };
