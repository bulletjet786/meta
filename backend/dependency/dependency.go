package dependency

import (
	"gopkg.in/natefinch/lumberjack.v2"
	"log/slog"
	"meta/backend/constants"
)

func InitLogger() {
	logPath := constants.MustAppDataLocalPath() + "\\var\\meta.log"
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
