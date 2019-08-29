import React from 'react';
import { connect } from 'react-redux';

import { AuthOpts } from '../../services/userAuth';
import { login, signup } from '../../store/user/actions';
import { StoreState, UserState } from '../../util/types';
import Modal from 'react-modal';
import styled, { withTheme } from 'styled-components';
import { Button } from './button';
import { Theme } from '../../themes/commons';

interface DispatchProps {
    onLogin: (email: string, password: string) => Promise<AuthOpts>;
    onSignup: (name: string, email: string, password: string) => Promise<void>;
}

interface OwnProps {
    isOpen: boolean;
    theme: Theme;
}

interface UserViewState extends UserState {
    readonly submitted: boolean;
    readonly register: boolean;
}

type Props = UserState & DispatchProps & OwnProps;

const ModalContent = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    max-height: 100%;
    overflow: auto;
    width: 310px;
`;

const ModalTitle = styled.h1`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    font-size: 20px;
    font-weight: 600;
    line-height: 1.2;
    margin: 0 0 25px;
    text-align: center;
`;

const ButtonStyled = styled(Button)`
    width: 100%;
`;

class LoginModal extends React.Component<Props, UserViewState> {
    constructor(props: any) {
        super(props);

        this.state = {
            token: '',
            email: '',
            userId: 0,
            password: '',
            name: '',
            submitted: false,
            register: false,
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
        const { email, name, password, register } = this.state;
        const re = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i);
        if (re.test(email) === false) {
            console.log(email, 'is not an email address');
            return;
        }
        if (register) {
            if (name && email && password) {
                this.props.onSignup(name, email, password);
                this.setState({ ...this.state, register: false });
            }
            return;
        }
        if (email && password) {
            this.props.onLogin(email, password);
        }
    };

    public render = () => {
        console.log('Render', this.state, this.props);
        const { email, name, password, submitted } = this.state;
        const { theme } = this.props;
        return (
            <Modal isOpen={this.props.userId === 0} style={theme.modalTheme}>
                <ModalContent>
                    <ModalTitle>Login</ModalTitle>
                    <form name="form" onSubmit={this.handleSubmit}>
                        <div
                            className={'form-group' + (submitted && !name ? ' has-error' : '')}
                            hidden={!this.state.register}
                        >
                            <label htmlFor="name">name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                value={name}
                                onChange={this.handleChange}
                            />
                            {submitted && !name && <div className="help-block">name is required</div>}
                        </div>
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
                            <ButtonStyled className="btn btn-primary">
                                {this.state.register ? 'Register' : 'Login'}
                            </ButtonStyled>
                            <ButtonStyled
                                className="btn btn-primary"
                                onClick={e => {
                                    e.preventDefault();
                                    this.setState({ ...this.state, register: !this.state.register });
                                }}
                            >
                                {this.state.register ? 'Login' : 'Register'}
                            </ButtonStyled>
                        </div>
                    </form>
                </ModalContent>
            </Modal>
        );
    };
}

const mapStateToProps = (state: StoreState): UserState => {
    console.log('mapStateToProps', state.user);
    return {
        ...state.user,
    };
};

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        onLogin: (email: string, password: string) => dispatch(login(email, password)),
        onSignup: (name: string, email: string, password: string) => dispatch(signup(name, email, password)),
    };
};

const LoginModalContainer = withTheme(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(LoginModal),
);

export { LoginModalContainer };
