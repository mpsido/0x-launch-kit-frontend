import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { AuthOpts } from '../../services/userAuth';
import { login, signup } from '../../store/user/actions';
import { StoreState, UserState } from '../../util/types';

interface DispatchProps {
    onLogin: (email: string, password: string) => Promise<AuthOpts>;
    onSignup: (user: string, email: string, password: string) => Promise<void>;
}

interface UserViewState extends UserState {
    readonly submitted: boolean;
}

type Props = UserViewState & DispatchProps;

class LoginModal extends React.Component<Props, UserViewState> {
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

    public handleSubmit = (e: any): void => {
        e.preventDefault();

        this.setState({ submitted: true });
        const { email, password } = this.state;
        const re = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i);
        if (re.test(email) === false) {
            console.log(email, 'is not an email address');
            return;
        }
        if (email && password) {
            // TODO the await does not really work
            // const authOpts = await this.props.onLogin(email, password);
            // console.log('Rendering Login', this.state, authOpts);
            // this.render();

            // TODO neither does promise fulfilment
            // this.props
            //     .onLogin(email, password)
            //     .then(authOpts => {
            //         // the promise succeeds but somehow authOpts is undefined here
            //         console.log('Rendering Login', this.state, authOpts);
            //         this.setState({ ...this.state, userId: authOpts.userId, token: authOpts.authorization });
            //         this.render();
            //     })
            //     .catch(e => {
            //         console.log('Rendering Login error', this.state, e);
            //     });

            // TODO neither does function wrapping
            const wrap = (fn: any) => {
                return () => {
                    fn()
                        .then((authOpts: AuthOpts) => {
                            console.log('Rendering Login', this.state, authOpts);
                            this.render();
                        })
                        .catch((e: Error) => {
                            console.log('Rendering Login error', this.state, e);
                        });
                };
            };
            wrap(() => this.props.onLogin(email, password))();
        }
    };

    public render = () => {
        console.log('Render', this.state);
        const { email, password, submitted, userId } = this.state;
        if (userId !== 0) {
            return null;
        }
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

const mapStateToProps = (state: StoreState): UserViewState => {
    console.log('mapStateToProps', state.user);
    return {
        ...state.user,
        submitted: false,
    };
};

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        onLogin: (email: string, password: string) => dispatch(login(email, password)),
        onSignup: (name: string, email: string, password: string) => dispatch(signup(name, email, password)),
    };
};

const LoginModalContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(LoginModal);

export { LoginModalContainer };
