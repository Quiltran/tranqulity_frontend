export interface MenuState {
    membersOpen: boolean
    guildsOpen: boolean
}

class MenuStore {
    menuState = $state<MenuState>({
        membersOpen: false,
        guildsOpen: false
    });

    constructor() {
        this.menuState = {
            membersOpen: false,
            guildsOpen: false,
        }
    }

    openGuilds() {
        this.menuState.membersOpen = false;
        this.menuState.guildsOpen = true;
    }

    openMembers() {
        this.menuState.guildsOpen = false;
        this.menuState.membersOpen = true;
    }

    closeMenus() {
        this.menuState.guildsOpen = false;
        this.menuState.membersOpen = false;
    }
}

export const menuStore = new MenuStore();