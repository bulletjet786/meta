package constants

import "testing"

func Test_appDataPath(t *testing.T) {
	tests := []struct {
		name    string
		want    string
		wantErr bool
	}{
		{
			name:    "default app data path",
			want:    "C:\\Users\\bullet\\AppData\\Roaming\\meta",
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := MustAppDataPath(); got != tt.want {
				t.Errorf("localAppDataPath() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_localAppDataPath(t *testing.T) {
	tests := []struct {
		name string
		want string
	}{
		{
			name: "default local app data path",
			want: "C:\\Users\\bullet\\AppData\\Local\\meta",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := MustAppDataLocalPath(); got != tt.want {
				t.Errorf("localAppDataPath() = %v, want %v", got, tt.want)
			}
		})
	}
}
