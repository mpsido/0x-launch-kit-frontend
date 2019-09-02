import React from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import styled, { withTheme } from 'styled-components';

import { AuthOpts } from '../../services/userAuth';
import { login, signup } from '../../store/user/actions';
import { Theme, themeDimensions } from '../../themes/commons';
import { StoreState, UserState } from '../../util/types';

import { Button } from './button';

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
    readonly tabChange: boolean;
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

const Input = styled.input`
    margin-bottom: 10px;
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px ${themeDimensions.horizontalPadding};
`;

const ButtonStyled = styled(Button)<{ register: boolean }>`
    width: 100%;
    margin-top: 20px;
    color: ${props => (props.register ? props.theme.componentsTheme.red : props.theme.componentsTheme.green)};
`;

const TabsContainer = styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;
`;

const TabButton = styled.div<{ isSelected: boolean; register: boolean }>`
    align-items: center;
    background-color: ${props =>
        props.isSelected ? 'transparent' : props.theme.componentsTheme.inactiveTabBackgroundColor};
    border-bottom-color: ${props => (props.isSelected ? 'transparent' : props.theme.componentsTheme.cardBorderColor)};
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-right-color: ${props => (props.isSelected ? props.theme.componentsTheme.cardBorderColor : 'transparent')};
    border-right-style: solid;
    border-right-width: 1px;
    color: ${props =>
        props.isSelected
            ? props.register
                ? props.theme.componentsTheme.red
                : props.theme.componentsTheme.green
            : props.theme.componentsTheme.textLight};
    cursor: ${props => (props.isSelected ? 'default' : 'pointer')};
    display: flex;
    font-weight: 600;
    height: 47px;
    justify-content: center;
    width: 100px;

    &:first-child {
        border-top-left-radius: ${themeDimensions.borderRadius};
    }

    &:last-child {
        border-left-color: ${props => (props.isSelected ? props.theme.componentsTheme.cardBorderColor : 'transparent')};
        border-left-style: solid;
        border-left-width: 1px;
        border-right: none;
        border-top-right-radius: ${themeDimensions.borderRadius};
    }
`;

const LabelContainer = styled.div`
    align-items: flex-end;
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
`;

const Label = styled.span`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    flex-shrink: 0;
    font-size: 14px;
    line-height: 1.2;
    margin-right: 15px;
`;

const LabelError = styled.span`
    color: ${props => props.theme.componentsTheme.red};
    flex-shrink: 0;
    font-size: 14px;
    line-height: 1.2;
    margin-right: 15px;
    font-size: 12px;
`;

const LabelSuccess = styled.span`
    color: ${props => props.theme.componentsTheme.green};
    flex-shrink: 0;
    font-size: 14px;
    line-height: 1.2;
    margin-right: 15px;
    font-size: 12px;
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
            loginError: '',
            tabChange: false,
            signupSuccess: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public handleChange(e: any): void {
        const { name, value } = e.target;
        this.setState(({ [name]: value } as any) as UserState);
    }

    public handleSubmit = (e: any): void => {
        e.preventDefault();

        this.setState({ submitted: true, tabChange: false });
        const { email, name, password, register } = this.state;
        const re = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i);
        if (re.test(email) === false) {
            return;
        }
        if (register) {
            if (name && email && password) {
                this.props.onSignup(name, email, password);
            }
            return;
        }
        if (email && password) {
            this.props.onLogin(email, password);
        }
    };

    public render = () => {
        const { email, name, password, register, submitted } = this.state;
        const { loginError, signupSuccess, theme } = this.props;
        return (
            <Modal isOpen={this.props.userId === 0} style={theme.modalTheme}>
                {' '}
                <ModalContent>
                    <TabsContainer>
                        <TabButton
                            isSelected={!register}
                            onClick={() => {
                                this.setState({ ...this.state, register: false, tabChange: true });
                            }}
                            register={false}
                        >
                            Login
                        </TabButton>
                        <TabButton
                            isSelected={register}
                            onClick={() => {
                                this.setState({ ...this.state, register: true, tabChange: true });
                            }}
                            register={true}
                        >
                            Register
                        </TabButton>
                    </TabsContainer>
                    <form name="form" onSubmit={this.handleSubmit}>
                        <Content>
                            <LabelContainer>
                                <LabelSuccess hidden={!signupSuccess}>Signup success!</LabelSuccess>
                                <LabelError hidden={signupSuccess || this.state.tabChange}>{loginError}</LabelError>
                            </LabelContainer>
                            <LabelContainer
                                className={`form-group ${submitted && !name ? ' has-error' : ''}`}
                                hidden={!this.state.register}
                            >
                                <Label hidden={!this.state.register}>Name</Label>
                            </LabelContainer>
                            <Input
                                hidden={!this.state.register}
                                type="text"
                                className="form-control"
                                name="name"
                                value={name}
                                onChange={this.handleChange}
                                placeholder={submitted && !name ? 'name is required' : ''}
                            />
                            <LabelContainer className={`form-group ${submitted && !email ? ' has-error' : ''}`}>
                                <Label>Email</Label>
                            </LabelContainer>
                            <Input
                                type="text"
                                className="form-control"
                                name="email"
                                value={email}
                                onChange={this.handleChange}
                                placeholder={submitted && !email ? 'email is required' : ''}
                            />
                            <LabelContainer className={`form-group ${submitted && !password ? ' has-error' : ''}`}>
                                <Label>Password</Label>
                            </LabelContainer>
                            <Input
                                type="password"
                                className="form-control"
                                name="password"
                                value={password}
                                onChange={this.handleChange}
                                placeholder={submitted && !password ? 'Password is required' : ''}
                            />
                            <div className="form-group">
                                <ButtonStyled className="btn btn-primary" register={register}>
                                    {register ? 'Register' : 'Login'}
                                </ButtonStyled>
                            </div>
                        </Content>
                    </form>
                </ModalContent>
            </Modal>
        );
    };
}

const mapStateToProps = (state: StoreState): UserState => {
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
