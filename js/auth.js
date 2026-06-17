class Auth {
    constructor() {
        this.baseUrl = 'http://localhost:5000/api';
        this.token = localStorage.getItem('token') || sessionStorage.getItem('token');
        this.currentUser = null;
        this.initializeSession();
    }

    async initializeSession() {
        if (this.token) {
            try {
                const response = await fetch(`${this.baseUrl}/profile`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    this.currentUser = data.user;
                } else {
                    this.logout();
                }
            } catch (error) {
                this.logout();
            }
        }
    }

    hashPassword(password) {
        // In a real application, use a proper password hashing algorithm
        // This is just for demonstration purposes
        return btoa(password);
    }

    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return password.length >= minLength &&
               hasUpperCase &&
               hasLowerCase &&
               hasNumbers &&
               hasSpecialChar;
    }

    async register(name, email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }
            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async login(email, password, remember = false) {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }
            this.token = data.token;
            this.currentUser = data.user;
            if (remember) {
                localStorage.setItem('token', this.token);
            } else {
                sessionStorage.setItem('token', this.token);
            }
            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
    }

    async getCurrentUser() {
        if (!this.token) {
            return null;
        }
        try {
            const response = await fetch(`${this.baseUrl}/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            const data = await response.json();
            this.currentUser = data.user;
            return data.user;
        } catch (error) {
            this.logout();
            return null;
        }
    }

    async updateProfile(updates) {
        try {
            const response = await fetch(`${this.baseUrl}/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }
            this.currentUser = { ...this.currentUser, ...updates };
            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async updateProfilePicture(file) {
        try {
            const formData = new FormData();
            formData.append('picture', file);

            const response = await fetch(`${this.baseUrl}/profile/picture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }

            this.currentUser.profilePicture = data.profilePicture;
            return data.profilePicture;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async addMedicalHistory(record) {
        try {
            const response = await fetch(`${this.baseUrl}/medical-history`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(record)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }

            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getMedicalHistory() {
        try {
            const response = await fetch(`${this.baseUrl}/medical-history`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }

            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async deleteMedicalHistory(recordId) {
        try {
            const response = await fetch(`${this.baseUrl}/medical-history/${recordId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }

            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async addAllergy(allergy) {
        try {
            const response = await fetch(`${this.baseUrl}/allergies`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(allergy)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }

            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getAllergies() {
        try {
            const response = await fetch(`${this.baseUrl}/allergies`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }

            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async deleteAllergy(allergyId) {
        try {
            const response = await fetch(`${this.baseUrl}/allergies/${allergyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }

            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getSettings() {
        try {
            const response = await fetch(`${this.baseUrl}/settings`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }

            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async updateSettings(settings) {
        try {
            const response = await fetch(`${this.baseUrl}/settings`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }

            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async resetPassword(email) {
        try {
            const response = await fetch(`${this.baseUrl}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }

            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async verifyEmail(token) {
        try {
            const response = await fetch(`${this.baseUrl}/verify-email?token=${token}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }
            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Social login methods
    initiateGoogleLogin() {
        window.location.href = `${this.baseUrl}/auth/google`;
    }

    initiateFacebookLogin() {
        window.location.href = `${this.baseUrl}/auth/facebook`;
    }

    handleAuthCallback(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
            this.initializeSession();
        }
    }
} 