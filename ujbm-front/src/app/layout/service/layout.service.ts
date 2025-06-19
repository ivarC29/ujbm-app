import { Injectable, effect, signal, computed, OnDestroy,  } from '@angular/core';
import { Subject } from 'rxjs';

export interface layoutConfig {
    preset?: string;
    primary?: string;
    surface?: string | undefined | null;
    darkTheme?: boolean;
    menuMode?: string;
}

interface LayoutState {
    staticMenuDesktopInactive?: boolean;
    overlayMenuActive?: boolean;
    configSidebarVisible?: boolean;
    staticMenuMobileActive?: boolean;
    menuHoverActive?: boolean;
}

interface MenuChangeEvent {
    key: string;
    routeEvent?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class LayoutService implements OnDestroy {
    //para detectar el modo oscuro del sistema
    private darkModeMediaQuery!: MediaQueryList;
    private mediaQueryListener!: (event: MediaQueryListEvent) => void;
    private hasUserPreference: boolean = false;

    _config: layoutConfig = {
        preset: 'Aura',
        primary: 'blue',
        surface: null,
        darkTheme: this.loadDarkModePreference(),// Cargar preferencia guardada
        menuMode: 'static'
    };

    _state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false
    };

    layoutConfig = signal<layoutConfig>(this._config);

    layoutState = signal<LayoutState>(this._state);

    private configUpdate = new Subject<layoutConfig>();

    private overlayOpen = new Subject<any>();

    private menuSource = new Subject<MenuChangeEvent>();

    private resetSource = new Subject();

    menuSource$ = this.menuSource.asObservable();

    resetSource$ = this.resetSource.asObservable();

    configUpdate$ = this.configUpdate.asObservable();

    overlayOpen$ = this.overlayOpen.asObservable();

    theme = computed(() => (this.layoutConfig()?.darkTheme ? 'light' : 'dark'));

    isSidebarActive = computed(() => this.layoutState().overlayMenuActive || this.layoutState().staticMenuMobileActive);

    isDarkTheme = computed(() => this.layoutConfig().darkTheme);

    getPrimary = computed(() => this.layoutConfig().primary);

    getSurface = computed(() => this.layoutConfig().surface);

    isOverlay = computed(() => this.layoutConfig().menuMode === 'overlay');

    transitionComplete = signal<boolean>(false);

    private initialized = false;

    constructor() {
        // detecctar si el sistema tiene modo oscuro
        this.setupSystemThemeDetection();
        effect(() => {
            const config = this.layoutConfig();
            if (config) {
                this.onConfigUpdate();
                // guardar la preferencia de tema solo si el usuario la ha establecido explícitamente
                if (this.hasUserPreference) {
                    this.saveDarkModePreference(config.darkTheme || false);
                }
            }
        });

        effect(() => {
            const config = this.layoutConfig();

            if (!this.initialized || !config) {
                this.initialized = true;
                return;
            }

            this.handleDarkModeTransition(config);
        });
    }
    ngOnDestroy(): void {
        // limpiar el listener cuando el servicio se destruye
        if (this.darkModeMediaQuery && this.mediaQueryListener) {
            this.darkModeMediaQuery.removeEventListener('change', this.mediaQueryListener);
        }
    }
    // detectar el modo oscuro del sistema
    private setupSystemThemeDetection(): void {
        this.hasUserPreference = localStorage.getItem('darkMode') !== null;
        
        // crear media query para detectar tema del sistema
        this.darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // listener para cambios en el tema del sistema
        this.mediaQueryListener = (e: MediaQueryListEvent) => {
            if (!this.hasUserPreference) {
                this.layoutConfig.update((state) => ({
                    ...state,
                    darkTheme: e.matches
                }));
            }
        };
        
        // add listener
        this.darkModeMediaQuery.addEventListener('change', this.mediaQueryListener);
        
        // aplicar tema inicial según preferencia del sistema si no hay preferencia de usuario
        if (!this.hasUserPreference) {
            this.layoutConfig.update((state) => ({
                ...state,
                darkTheme: this.darkModeMediaQuery.matches
            }));
        }
    }

        // cargar preferencia de tema oscuro desde localStorage
        private loadDarkModePreference(): boolean {
            const savedPreference = localStorage.getItem('darkMode');
            if (savedPreference !== null) {
                this.hasUserPreference = true;
                return JSON.parse(savedPreference);
            }
        
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
            
        }

        // guardar preferencia de tema oscuro en localStorage
        private saveDarkModePreference(isDark: boolean): void {
            localStorage.setItem('darkMode', JSON.stringify(isDark));
            this.hasUserPreference = true;
        }
    private handleDarkModeTransition(config: layoutConfig): void {
        if ((document as any).startViewTransition) {
            this.startViewTransition(config);
        } else {
            this.toggleDarkMode(config);
            this.onTransitionEnd();
        }
    }

    private startViewTransition(config: layoutConfig): void {
        const transition = (document as any).startViewTransition(() => {
            this.toggleDarkMode(config);
        });

        transition.ready
            .then(() => {
                this.onTransitionEnd();
            })
            .catch(() => {});
    }

    toggleDarkMode(config?: layoutConfig): void {
        const _config = config || this.layoutConfig();
        if (_config.darkTheme) {
            document.documentElement.classList.add('app-dark');
        } else {
            document.documentElement.classList.remove('app-dark');
        }
         // y almacenar el cambio cuando se llama directamente a esta función
         this.hasUserPreference = true;
         this.saveDarkModePreference(_config.darkTheme || false);
    }

    private onTransitionEnd() {
        this.transitionComplete.set(true);
        setTimeout(() => {
            this.transitionComplete.set(false);
        });
    }

    onMenuToggle() {
        if (this.isOverlay()) {
            this.layoutState.update((prev) => ({ ...prev, overlayMenuActive: !this.layoutState().overlayMenuActive }));

            if (this.layoutState().overlayMenuActive) {
                this.overlayOpen.next(null);
            }
        }

        if (this.isDesktop()) {
            this.layoutState.update((prev) => ({ ...prev, staticMenuDesktopInactive: !this.layoutState().staticMenuDesktopInactive }));
        } else {
            this.layoutState.update((prev) => ({ ...prev, staticMenuMobileActive: !this.layoutState().staticMenuMobileActive }));

            if (this.layoutState().staticMenuMobileActive) {
                this.overlayOpen.next(null);
            }
        }
    }

    isDesktop() {
        return window.innerWidth > 991;
    }

    isMobile() {
        return !this.isDesktop();
    }

    onConfigUpdate() {
        this._config = { ...this.layoutConfig() };
        this.configUpdate.next(this.layoutConfig());
    }

    onMenuStateChange(event: MenuChangeEvent) {
        this.menuSource.next(event);
    }

    reset() {
        this.resetSource.next(true);
    }
}
