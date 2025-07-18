package text

type LibraryFolder struct {
	Path                   string            `vdf:"path"`
	Label                  string            `vdf:"label"`
	ContentID              int64             `vdf:"contentid"`
	TotalSize              int64             `vdf:"totalsize"`
	UpdateCleanBytesTally  int64             `vdf:"update_clean_bytes_tally"`
	TimeLastUpdateVerified int64             `vdf:"time_last_update_verified"`
	Apps                   map[string]string `vdf:"apps"`
}

type LibraryFoldersData struct {
	Folders map[string]LibraryFolder `vdf:"libraryfolders"`
}
