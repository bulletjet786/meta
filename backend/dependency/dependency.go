package dependency

import (
	"log/slog"

	"gopkg.in/natefinch/lumberjack.v2"

	"meta/backend/constants"
)

func InitLogger() {
	logPath := constants.MustAppDataLocalPath() + "\\var\\logs\\meta.log"
	log := &lumberjack.Logger{
		Filename:   logPath,
		MaxSize:    5,
		MaxBackups: 5,
		MaxAge:     30,
		Compress:   false,
		LocalTime:  true,
	}
	defaultLogger := slog.New(slog.NewTextHandler(log, nil))
	slog.SetDefault(defaultLogger)
}
