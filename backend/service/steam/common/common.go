package common

type Status struct {
	State string `json:"state"`
}

type StatusSubscriber func(status Status)
