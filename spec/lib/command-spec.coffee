EventEmitter = require('events').EventEmitter

describe 'Command', ->

  Given -> @uuid = jasmine.createSpyObj 'node-uuid', ['v1']
  Given -> @uuid.v1.andReturn 1
  Given -> @Packet = requireSubject 'lib/packet', {
    'node-uuid': @uuid
  }
  Given -> @Command = requireSubject 'lib/command', {
    './packet': @Packet
  }
  Given -> spyOn(@Command, 'init').andCallThrough()

  describe '#', ->

    When -> @res = @Command()
    Then -> expect(@res instanceof @Command).toBe true
    And -> expect(@res instanceof EventEmitter).toBe true

  describe '#(command:Command)', ->

    Given -> @command = @Command()
    When -> @res = @Command @command
    Then -> expect(@res).toBe @command

  describe '#isCommand (command:Command)', ->

    Given -> @command = new @Command
    Then -> expect(@Command.isCommand @command).toBe true

  describe '#isCommand (command:Object={c:Boolean=true, name:String, args:Array})', ->

    Given -> @command = c:true, name:'unknown', args:[]
    Then -> expect(@Command.isCommand @command).toBe true

  describe '#isCommand (command:Object={name:String, args:Array})', ->

    Given -> @command = name:'unknown', args:[]
    Then -> expect(@Command.isCommand @command).toBe false

  describe '#isCommand (command:mixed=null)', ->

    Given -> @command = null
    Then -> expect(@Command.isCommand @command).toBe false

  describe '#init (command:Command, name:String, args:Array)', ->

    Given -> @command = @Command()
    Given -> @name = 'unknown'
    Given -> @args = []
    When -> @res = @Command.init @command, @name, @args
    Then -> expect(@res).toBe @command
    And -> expect(@res.name).toBe @name
    And -> expect(@res.args).toEqual @args

  describe '#init (command:Command, name:String, args:mixed=1)', ->

    Given -> @command = @Command()
    Given -> @name = 'unknown'
    Given -> @args = 1
    When -> @res = @Command.init @command, @name, @args
    Then -> expect(@res).toBe @command
    And -> expect(@res.name).toBe @name
    And -> expect(@res.args).toEqual [@args]

  describe '#init (command:Command, name:String, args:mixed=null)', ->

    Given -> @command = @Command()
    Given -> @name = 'unknown'
    Given -> @args = null
    When -> @res = @Command.init @command, @name, @args
    Then -> expect(@res).toBe @command
    And -> expect(@res.name).toBe @name
    And -> expect(@res.args).toEqual []

  describe '#init (command:Command, name:String)', ->

    Given -> @command = @Command()
    Given -> @name = 'unknown'
    When -> @res = @Command.init @command, @name
    Then -> expect(@res).toBe @command
    And -> expect(@res.name).toBe @name
    And -> expect(@res.args).toEqual []

  describe '#init (command:Command, name:String=null)', ->

    Given -> @command = @Command()
    Given -> @name = null
    When -> @res = @Command.init @command, @name
    Then -> expect(@res).toBe @command
    And -> expect(@res.name).toBe 'unknown'
    And -> expect(@res.args).toEqual []

  describe '#init (command:Command, data:Object)', ->

    Given -> @command = @Command()
    Given -> @data = name:'unknown', args:[]
    When -> @res = @Command.init @command, @data
    Then -> expect(@res).toBe @command
    And -> expect(@res.name).toBe 'unknown'
    And -> expect(@res.args).toEqual []

  describe '#init (command:Command, data:Command)', ->

    Given -> @command = @Command()
    Given -> @b = @Command()
    When -> @res = @Command.init @command, @data
    Then -> expect(@res).toBe @command
    And -> expect(@res.name).toBe 'unknown'
    And -> expect(@res.args).toEqual []

  describe '#init (command:Command)', ->

    Given -> @command = @Command()
    When -> @res = @Command.init @command
    Then -> expect(@res).toBe @command
    And -> expect(@res.name).toBe 'unknown'
    And -> expect(@res.args).toEqual []

  describe '#init (command:Command=null)', ->

    Given -> @fn = => @Command.init null
    Then -> expect(@fn).toThrow new Error 'command must be a Command'

  describe.only '#parse (chunk:String)', ->

    Given -> @command = @Command()
    Given -> @chunk = @command.toString()
    When -> @res = @Command.parse @chunk
    Then -> expect(@res).toEqual @command

  describe '#parse (pack:Packet)', ->

    Given -> @command = @Command()
    Given -> @packet = @command.toPacket()
    When -> @res = @Command.parse @packet
    Then -> expect(@res).toEqual @command

  describe '#parse (data:Object)', ->

    Given -> @data = [1,'hi','there']
    When -> @res = @Command.parse @data
    Then -> expect(@res.name).toEqual 'hi'
    And -> expect(@res.args).toEqual ['there']

  describe '#parse (command:Command)', ->

    Given -> @command = @Command()
    When -> @res = @Command.parse @command
    Then -> expect(@res).toBe @command

  describe 'prototype', ->

    Given -> @name = 'say'
    Given -> @data = ['hello', 'world']
    Given -> @command = @Command @name, @data

    describe '#toString', ->

      Given -> spyOn(@command,'toPacket').andCallThrough()
      Given -> spyOn(@Packet.prototype,'toString').andCallThrough()
      When -> @command.toString()
      Then -> expect(@command.toPacket).toHaveBeenCalled()
      And -> expect(@Packet.prototype.toString).toHaveBeenCalled()

    describe '#toPacket', ->

      Given -> spyOn(@command,'toJSON').andCallThrough()
      When -> @pack = @command.toPacket()
      Then -> expect(@pack instanceof @Packet).toBe true
      And -> expect(@command.toJSON).toHaveBeenCalled()
      And -> expect(@pack.type).toBe 1
      And -> expect(@pack.id).toBe 1
      And -> expect(@pack.head).toEqual {}
      And -> expect(@pack.body).toEqual @command.toJSON()

    describe '#toJSON', ->

      When -> expect(@command.toJSON()).toEqual [1, 'unknown', 'hello', 'world']

