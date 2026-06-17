class DataManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.medicalHistory = JSON.parse(localStorage.getItem('medicalHistory')) || {};
        this.allergies = JSON.parse(localStorage.getItem('allergies')) || {};
        this.settings = JSON.parse(localStorage.getItem('settings')) || {};
        this.medications = JSON.parse(localStorage.getItem('medications')) || [];
        this.notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    }

    // User Management
    register(name, email, password) {
        if (this.users.find(user => user.email === email)) {
            throw new Error('Email already registered');
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password, // In a real app, this should be hashed
            profilePicture: null,
            phone: '',
            dob: '',
            address: ''
        };

        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        return { message: 'Registration successful' };
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        this.currentUser = { ...user };
        delete this.currentUser.password; // Don't store password in currentUser
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        return this.currentUser;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    getCurrentUser() {
        return this.currentUser;
    }

    updateProfile(updates) {
        if (!this.currentUser) throw new Error('Not logged in');

        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) throw new Error('User not found');

        this.users[userIndex] = { ...this.users[userIndex], ...updates };
        this.currentUser = { ...this.currentUser, ...updates };

        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        return this.currentUser;
    }

    // Medical History Management
    addMedicalHistory(record) {
        if (!this.currentUser) throw new Error('Not logged in');

        const userId = this.currentUser.id;
        if (!this.medicalHistory[userId]) {
            this.medicalHistory[userId] = [];
        }

        const newRecord = {
            id: Date.now().toString(),
            ...record,
            dateAdded: new Date().toISOString()
        };

        this.medicalHistory[userId].push(newRecord);
        localStorage.setItem('medicalHistory', JSON.stringify(this.medicalHistory));
        return newRecord;
    }

    getMedicalHistory() {
        if (!this.currentUser) throw new Error('Not logged in');
        return this.medicalHistory[this.currentUser.id] || [];
    }

    deleteMedicalHistory(recordId) {
        if (!this.currentUser) throw new Error('Not logged in');

        const userId = this.currentUser.id;
        if (!this.medicalHistory[userId]) return;

        this.medicalHistory[userId] = this.medicalHistory[userId].filter(r => r.id !== recordId);
        localStorage.setItem('medicalHistory', JSON.stringify(this.medicalHistory));
    }

    // Allergy Management
    addAllergy(allergy) {
        if (!this.currentUser) throw new Error('Not logged in');

        const userId = this.currentUser.id;
        if (!this.allergies[userId]) {
            this.allergies[userId] = [];
        }

        const newAllergy = {
            id: Date.now().toString(),
            ...allergy,
            dateAdded: new Date().toISOString()
        };

        this.allergies[userId].push(newAllergy);
        localStorage.setItem('allergies', JSON.stringify(this.allergies));
        return newAllergy;
    }

    getAllergies() {
        if (!this.currentUser) throw new Error('Not logged in');
        return this.allergies[this.currentUser.id] || [];
    }

    deleteAllergy(allergyId) {
        if (!this.currentUser) throw new Error('Not logged in');

        const userId = this.currentUser.id;
        if (!this.allergies[userId]) return;

        this.allergies[userId] = this.allergies[userId].filter(a => a.id !== allergyId);
        localStorage.setItem('allergies', JSON.stringify(this.allergies));
    }

    // Settings Management
    getSettings() {
        if (!this.currentUser) throw new Error('Not logged in');
        return this.settings[this.currentUser.id] || {
            notifications: {
                email: true,
                sms: false,
                reminders: true
            },
            privacy: {
                shareMedicalHistory: true,
                shareAllergies: true
            }
        };
    }

    updateSettings(settings) {
        if (!this.currentUser) throw new Error('Not logged in');

        const userId = this.currentUser.id;
        this.settings[userId] = settings;
        localStorage.setItem('settings', JSON.stringify(this.settings));
        return settings;
    }

    // Profile Picture Management
    updateProfilePicture(dataUrl) {
        if (!this.currentUser) throw new Error('Not logged in');
        return this.updateProfile({ profilePicture: dataUrl });
    }

    // Medication Management
    addMedication(medication) {
        if (!this.currentUser) {
            throw new Error('User must be logged in to add medications');
        }

        const newMedication = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            ...medication,
            createdAt: new Date().toISOString(),
            history: []
        };

        this.medications.push(newMedication);
        this.saveMedications();
        this.createMedicationNotification(newMedication);
        return newMedication;
    }

    getMedications() {
        if (!this.currentUser) {
            throw new Error('User must be logged in to view medications');
        }
        return this.medications.filter(m => m.userId === this.currentUser.id);
    }

    markMedicationAsTaken(medicationId) {
        const medication = this.medications.find(m => m.id === medicationId);
        if (!medication) {
            throw new Error('Medication not found');
        }

        const takenRecord = {
            timestamp: new Date().toISOString(),
            status: 'taken'
        };

        medication.history.push(takenRecord);
        this.saveMedications();
    }

    deleteMedication(medicationId) {
        const index = this.medications.findIndex(m => m.id === medicationId);
        if (index === -1) {
            throw new Error('Medication not found');
        }

        this.medications.splice(index, 1);
        this.saveMedications();
    }

    saveMedications() {
        localStorage.setItem('medications', JSON.stringify(this.medications));
    }

    // Notification Management
    createMedicationNotification(medication) {
        const notification = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            title: 'New Medication Added',
            message: `Reminder to take ${medication.name} at ${medication.times.join(', ')}`,
            type: 'medication',
            read: false,
            createdAt: new Date().toISOString()
        };

        this.notifications.push(notification);
        this.saveNotifications();
    }

    getNotifications() {
        if (!this.currentUser) {
            throw new Error('User must be logged in to view notifications');
        }
        return this.notifications
            .filter(n => n.userId === this.currentUser.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    markNotificationAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
        }
    }

    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    // Medication Interaction and Allergy Check
    checkInteractions() {
        if (!this.currentUser) {
            throw new Error('User must be logged in to check interactions');
        }

        const userMedications = this.getMedications().map(med => med.name.toLowerCase());
        const userAllergies = this.getAllergies().map(allergy => allergy.name.toLowerCase());
        const interactions = [];

        // Simplified interaction logic (replace with a real database lookup in a production app)
        const commonInteractions = {
            // Example: Interaction between a specific medication class and an allergy
            'aspirin': { // Medication name (lowercase)
                'warnings': ['Avoid if allergic to NSAIDs'] // Warnings related to this medication
            },
            'ibuprofen': { // Medication name (lowercase)
                 'warnings': ['Avoid if allergic to NSAIDs'] // Warnings related to this medication
            },
            'penicillin': { // Medication name (lowercase)
                'warnings': ['Avoid if allergic to penicillin or cephalosporins'] // Warnings related to this medication
            },
             'sulfonamides': { // Medication name (lowercase) - represents a class
                'warnings': ['Avoid if allergic to sulfa drugs'] // Warnings related to this medication class
            }
            // Add more common medications and their potential allergy interactions here
        };

        // Check for medication-allergy interactions
        userMedications.forEach(medName => {
            if (commonInteractions[medName]) {
                userAllergies.forEach(allergyName => {
                     if (commonInteractions[medName].warnings.some(warning => warning.toLowerCase().includes(allergyName))) {
                         interactions.push(`Potential interaction: ${medName.charAt(0).toUpperCase() + medName.slice(1)} and allergy to ${allergyName}`);
                     }
                });
                 // Also add general warnings for the medication if any
                 if (commonInteractions[medName].warnings.length > 0) {
                     commonInteractions[medName].warnings.forEach(warning => {
                         if (!interactions.includes(`Warning for ${medName.charAt(0).toUpperCase() + medName.slice(1)}: ${warning}`)){
                             interactions.push(`Warning for ${medName.charAt(0).toUpperCase() + medName.slice(1)}: ${warning}`);
                         }
                     });
                 }
            }
        });

        // Add placeholder for general medication-medication interactions (requires a more complex database)
        if (userMedications.length > 1) {
            interactions.push('Note: Consider potential interactions between multiple medications. Consult a healthcare professional.');
        }

        return interactions;
    }
}

// Create a global instance
const dataManager = new DataManager(); 